import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    role: 'principal' | 'teacher' | 'student' | 'it_admin';
    studentId?: string; // Unique for students
    rfidUid?: string; // Unique, sparse
    classId?: mongoose.Types.ObjectId; // Reference to Class model
    profileParams?: Record<string, any>; // Flexible for future usage
    pushSubscription?: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    };
    otp?: {
        code: string;
        expiresAt: Date;
    };
    lastPasswordResetAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true },
        phoneNumber: { type: String, unique: true, sparse: true },
        password: { type: String, select: false }, // Hashed password, excluded by default
        role: {
            type: String,
            enum: ['principal', 'teacher', 'student', 'it_admin'],
            required: true,
            default: 'student',
        },
        studentId: { type: String, unique: true, sparse: true },
        rfidUid: { type: String, unique: true, sparse: true },
        classId: { type: Schema.Types.ObjectId, ref: 'Class' },
        profileParams: { type: Map, of: String },
        otp: {
            code: { type: String, select: false },
            expiresAt: { type: Date, select: false }
        },
        lastPasswordResetAt: { type: Date, select: false },
        pushSubscription: {
            endpoint: { type: String },
            keys: {
                p256dh: { type: String },
                auth: { type: String },
            },
        },
    },
    { timestamps: true }
);

// Prevent re-compilation of the model in Next.js hot reload
if (mongoose.models.User) {
    delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
