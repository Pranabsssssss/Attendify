
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession();
        if (!session || session.role !== 'it_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const deletedUser = await User.findByIdAndDelete(params.id);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession();
        if (!session || session.role !== 'it_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { email, studentId } = body; // Only allow updating these for now as per request

        await dbConnect();

        // Check for duplicates before updating
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: params.id } });
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use by another user' }, { status: 409 });
            }
        }
        if (studentId) {
            const existingStudent = await User.findOne({ studentId, _id: { $ne: params.id } });
            if (existingStudent) {
                return NextResponse.json({ error: 'Student ID already in use' }, { status: 409 });
            }
        }

        const updateData: any = {};
        if (email !== undefined) updateData.email = email;
        if (studentId !== undefined) updateData.studentId = studentId;

        const updatedUser = await User.findByIdAndUpdate(params.id, updateData, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
