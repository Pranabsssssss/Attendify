import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoliday extends Document {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    academicYear: string; // e.g., "2025-2026"
    createdAt: Date;
    updatedAt: Date;
}

const HolidaySchema: Schema<IHoliday> = new Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        description: { type: String },
        academicYear: { type: String, required: true },
    },
    { timestamps: true }
);

// Force recompilation of model if it exists (Fix for Next.js Hot Reload Schema changes)
if (mongoose.models.Holiday) {
    delete mongoose.models.Holiday;
}

const Holiday: Model<IHoliday> = mongoose.model<IHoliday>('Holiday', HolidaySchema);

export default Holiday;
