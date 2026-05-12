import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    performedBy?: mongoose.Types.ObjectId; // Optional if system action
    details?: Record<string, any>;
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
    {
        action: { type: String, required: true }, // e.g., "LOGIN", "UPDATE_ATTENDANCE"
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        details: { type: Map, of: Schema.Types.Mixed },
        ipAddress: { type: String },
    },
    { timestamps: true }
);

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
