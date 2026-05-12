import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AttendanceStatus {
    PRESENT = 'Present',
    LATE = 'Late',
    ABSENT = 'Absent',
    LEAVE = 'Leave',
    HOLIDAY = 'Holiday',
}

export interface IAttendance extends Document {
    student: mongoose.Types.ObjectId;
    date: Date; // Normalized to midnight UTC or IST
    entryTime?: Date;
    status: AttendanceStatus;
    lateReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        entryTime: { type: Date },
        status: {
            type: String,
            enum: Object.values(AttendanceStatus),
            required: true,
        },
        lateReason: { type: String },
    },
    { timestamps: true }
);

// Compound index to ensure one attendance record per student per day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
