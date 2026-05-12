import mongoose, { Schema, Document, Model } from 'mongoose';

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface ILeave extends Document {
    student: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    adminUtils?: {
        reviewedBy: mongoose.Types.ObjectId | any; // Populated User
        message: string;
    };
    reviewedBy?: mongoose.Types.ObjectId; // Backend compat
    rejectionReason?: string; // Backend compat
    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema: Schema<ILeave> = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(LeaveStatus),
            default: LeaveStatus.PENDING,
        },
        adminUtils: {
            reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            message: { type: String }
        },
        // Deprecated but kept for compatibility
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: { type: String },
    }, { timestamps: true });

// Force recompilation of model if it exists (Fix for Next.js Hot Reload Schema changes)
if (mongoose.models.Leave) {
    delete mongoose.models.Leave;
}

const Leave: Model<ILeave> = mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
