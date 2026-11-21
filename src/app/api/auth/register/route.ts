import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import Class from '@/models/Class';
import { hashPassword } from '@/lib/auth/password';

// NEXT_PUBLIC values ship to browsers, so registration codes are enrollment
// gates for a deployment, not secrets or a replacement for access control.
const ACCESS_CODES = {
    it_admin: process.env.NEXT_PUBLIC_ACCESS_CODE_IT_ADMIN,
    principal: process.env.NEXT_PUBLIC_ACCESS_CODE_PRINCIPAL,
    teacher: process.env.NEXT_PUBLIC_ACCESS_CODE_TEACHER,
    student: process.env.NEXT_PUBLIC_ACCESS_CODE_STUDENT,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phoneNumber, password, role, accessCode, studentId, rfidUid, classId } = body;
        console.log('DEBUG: Registration Request', {
            role,
            classId,
            phoneNumber,
            studentId
        });

        // Note: Password is NOT required for Students/Teachers (auto-generated from ID/Phone)
        if (!name || !role || !accessCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        // Specific checks
        if (role === 'teacher' && !phoneNumber) return NextResponse.json({ error: 'Phone Number is required' }, { status: 400 });
        if (role === 'student' && !studentId) return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });

        // Only require manual password for IT Admin
        if (role === 'it_admin' && !password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }
        if (role === 'principal' && !phoneNumber) {
            return NextResponse.json({ error: 'Phone Number is required' }, { status: 400 });
        }

        // 1. Validate Access Code
        const expectedCode = ACCESS_CODES[role as keyof typeof ACCESS_CODES];
        if (!expectedCode || accessCode !== expectedCode) {
            return NextResponse.json({ error: 'Invalid Access Code for this role' }, { status: 403 });
        }

        await dbConnect();

        // 2. Check Exists
        const existingQuery: any[] = [];
        if (email) existingQuery.push({ email });
        if (phoneNumber) existingQuery.push({ phoneNumber });
        if (studentId) existingQuery.push({ studentId });
        if (rfidUid) existingQuery.push({ rfidUid });

        if (existingQuery.length > 0) {
            const existingUser = await User.findOne({ $or: existingQuery });
            if (existingUser) {
                return NextResponse.json({ error: 'User already exists (Email, Phone, ID, or RFID)' }, { status: 409 });
            }
        }

        // 3. Determine Password
        let finalPassword = password;
        if (role === 'student') {
            // Auto-set password to last 8 digits of Student ID
            finalPassword = (studentId && studentId.length >= 8) ? studentId.slice(-8) : studentId || '12345678';
        } else if (role === 'teacher' || role === 'principal') {
            // Auto-set password to last 8 digits of Phone Number
            finalPassword = (phoneNumber && phoneNumber.length >= 8) ? phoneNumber.slice(-8) : phoneNumber || '12345678';
        }

        // 4. Hash Password
        const hashedPassword = await hashPassword(finalPassword);

        // 3.5 Resolve Class ID (if Student)
        // 3.5 Resolve Class ID (for Student AND Teacher)
        let resolvedClassId = undefined;
        if ((role === 'student' || role === 'teacher') && classId) {
            // Expecting format "10-A" or just "10" (default section A)
            const parts = classId.split('-');
            const className = parts[0].trim();
            const section = parts.length > 1 ? parts[1].trim().toUpperCase() : 'A';

            // --- VALIDATION START ---
            const rangeStart = parseInt(process.env.NEXT_PUBLIC_CLASS_RANGE_START || '6');
            const rangeEnd = parseInt(process.env.NEXT_PUBLIC_CLASS_RANGE_END || '12');
            const restrictedSections = (process.env.NEXT_PUBLIC_RESTRICTED_SECTIONS || '').split(',').map(s => s.trim().toUpperCase());

            // 1. Check Numeric Range
            const classNum = parseInt(className);
            if (isNaN(classNum) || classNum < rangeStart || classNum > rangeEnd) {
                return NextResponse.json({
                    error: `Class '${className}' is not allowed. Allowed range: ${rangeStart}-${rangeEnd}`
                }, { status: 400 });
            }

            // 2. Check Restricted Section
            // 2. Check Restricted Section (Generic or Specific)
            const isRestricted = restrictedSections.some(r => {
                if (r.includes('-')) {
                    // Specific Class-Section (e.g. "6-C")
                    return r === `${className}-${section}`;
                }
                // Generic Section (e.g. "G")
                return r === section;
            });

            if (isRestricted) {
                return NextResponse.json({
                    error: `Class/Section '${className}-${section}' is restricted and cannot be selected.`
                }, { status: 400 });
            }
            // --- VALIDATION END ---

            let classDoc = await Class.findOne({ name: className, section });

            if (!classDoc) {
                // Auto-create class if it doesn't exist (Simplify onboarding)
                classDoc = await Class.create({ name: className, section });
            }
            resolvedClassId = classDoc._id;
            console.log('DEBUG: Resolved Class ID:', resolvedClassId);
        }

        // 4. Create User
        const newUser = await User.create({
            name,
            email: email || undefined,
            phoneNumber: phoneNumber || undefined,
            password: hashedPassword,
            role,
            studentId: role === 'student' ? studentId : undefined,
            rfidUid: rfidUid || undefined,
            classId: resolvedClassId,
        });

        // 5. Post-Creation Actions (Teacher Assignment)
        if (role === 'teacher' && resolvedClassId) {
            // Assign this teacher to the class
            await Class.findByIdAndUpdate(resolvedClassId, { classTeacher: newUser._id });
        }

        return NextResponse.json({
            message: 'User registered successfully',
            userId: newUser._id,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
