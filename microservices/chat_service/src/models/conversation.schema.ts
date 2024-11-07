import { IConversationDocument } from '@chats/types/chatTypes';
import { Model, model, Schema } from 'mongoose';

const conversationSchema: Schema = new Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  senderUsername: { type: String, required: true, index: true },
  receiverUsername: { type: String, required: true, index: true }
});

export const conversationModel: Model<IConversationDocument> = model<IConversationDocument>('ConversationModel', conversationSchema);
