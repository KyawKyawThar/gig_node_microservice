import { model, Model, Schema } from 'mongoose';
import { ISellerDocument } from '@user/types/sellerTypes';

const sellerSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    userName: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    profilePicture: { type: String, required: true },
    description: { type: String, required: true },
    profilePublicID: { type: String, required: true },
    oneliner: { type: String, default: '' },
    country: { type: String, required: true },
    languages: [
      {
        language: { type: String, required: true }
      },
      {
        level: { type: String, required: true }
      }
    ],
    skills: [{ type: String, required: true }],
    ratingCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    ratingCategories: {
      five: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      four: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      three: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      two: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      one: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    responseTime: { type: Number, default: 0 },
    recentDelivery: { type: Date, default: '' },
    experience: [
      {
        company: { type: String },
        title: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        currentlyWorkingHere: { type: Boolean, default: false }
      }
    ],
    educations: [
      {
        country: { type: String },
        title: { type: String },
        university: { type: String },
        major: { type: String },
        year: { type: Date }
      }
    ],
    socialLinks: [{ type: String }],
    certificates: [{ name: { type: String }, from: { type: String }, to: { type: String } }],
    ongoingJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelJobs: { type: Number, default: 0 },
    totalEarning: { type: Number, default: 0 },
    totalGigs: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now() }
  },
  { versionKey: false }
);

export const SellerModel: Model<ISellerDocument> = model<ISellerDocument>('SellerModel', sellerSchema);
