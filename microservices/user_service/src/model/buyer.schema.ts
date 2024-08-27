import { IBuyerDocument } from '@user/types/buyerTypes';
import mongoose, { Schema, Model, model } from 'mongoose';

const buyerSchema: Schema = new Schema(
  {
    username: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    profilePicture: { type: String, required: true },
    country: { type: String, required: true },
    isSeller: { type: Boolean, required: true, default: false },
    purchasedGigs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }],
    createdAt: { type: Date }
  },

  { versionKey: false }
);

export const BuyerModel: Model<IBuyerDocument> = model<IBuyerDocument>('BuyerModel', buyerSchema);
