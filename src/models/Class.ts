import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClass extends Document {
    name: string; // e.g., "10", "12"
    section: string; // e.g., "A", "B"
    classTeacher?: mongoose.Types.ObjectId; // Reference to User (Teacher role)
    createdAt: Date;
    updatedAt: Date;
}

const ClassSchema: Schema<IClass> = new Schema(
    {
        name: { type: String, required: true },
        section: { type: String, required: true },
        classTeacher: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate Class Name + Section (e.g., 10-A)
ClassSchema.index({ name: 1, section: 1 }, { unique: true });

const Class: Model<IClass> = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

export default Class;
