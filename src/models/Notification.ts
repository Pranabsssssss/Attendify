import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    title: string;
    message: string;
    isRead: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'error'],
            default: 'info',
        },
    },
    { timestamps: true }
);

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
