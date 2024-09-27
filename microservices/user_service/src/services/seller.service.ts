import { IBuyerReviewMessageDetails, IRatingTypes, ISellerDocument, ISellerOrderMessage } from '@user/types/sellerTypes';
import { SellerModel } from '@user/model/seller.schema';
import { updateBuyerIsSellerProp } from '@user/services/buyer.service';

export const getSellerById = async (sellerId: string): Promise<ISellerDocument | null> => {
  //new mongoose.types.ObjectId(sellerId)
  return (await SellerModel.findOne({ _id: sellerId }).exec()) as ISellerDocument;
};

export const getSellerByEmail = async (sellerEmail: string): Promise<ISellerDocument | null> => {
  return (await SellerModel.findOne({ email: sellerEmail }).exec()) as ISellerDocument;
};

export const getSellerByUsername = async (sellerUsername: string): Promise<ISellerDocument | null> => {
  return (await SellerModel.findOne({ userName: sellerUsername }).exec()) as ISellerDocument;
};

export const getRandomSeller = async (size: number): Promise<ISellerDocument[] | null> => {
  return (await SellerModel.aggregate([{ $sample: { size } }]).exec()) as ISellerDocument[];
};

export const createSeller = async (sellerData: ISellerDocument): Promise<ISellerDocument | null> => {
  const seller = (await SellerModel.create(sellerData)) as ISellerDocument;
  await updateBuyerIsSellerProp(seller.email!);
  return seller;
};

export const updateSeller = async (sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument | null> => {
  const updateSeller = (await SellerModel.findByIdAndUpdate(
    { _id: sellerId },
    {
      $set: {
        profilePublicID: sellerData.profilePublicID,
        fullName: sellerData.fullName,
        profilePicture: sellerData.profilePicture,
        description: sellerData.description,
        country: sellerData.country,
        languages: sellerData.languages,
        responseTime: sellerData.responseTime,
        experience: sellerData.experience,
        educations: sellerData.educations,
        socialLinks: sellerData.socialLinks,
        certificates: sellerData.certificates,
        onliner: sellerData.onliner,
        skills: sellerData.skills
      }
    },
    { new: true }
  ).exec()) as ISellerDocument;

  return updateSeller;
};

export const updateTotalGigsCount = async (sellerId: string, count: number): Promise<ISellerDocument | null> => {
  return (await SellerModel.findByIdAndUpdate({ _id: sellerId }, { $inc: { totalGigs: count } })) as ISellerDocument;
};

export const updateSellerOngoingJobsProp = async (sellerId: string, ongoingJob: number): Promise<ISellerDocument | null> => {
  return (await SellerModel.findByIdAndUpdate({ _id: sellerId }, { $inc: { ongoingJobs: ongoingJob } }).exec()) as ISellerDocument;
};

export const updateSellerCancelledJobsProp = async (sellerId: string): Promise<ISellerDocument | null> => {
  return (await SellerModel.findByIdAndUpdate({ _id: sellerId }, { $inc: { cancelJobs: 1, ongoingJobs: -1 } }).exec()) as ISellerDocument;
};

export const updateSellerCompletedJobsProp = async (data: ISellerOrderMessage): Promise<void> => {
  const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;

  await SellerModel.updateOne(
    { _id: sellerId },
    { $inc: { ongoingJobs, completedJobs, totalEarnings }, $set: { responseDeliveries: new Date(recentDelivery) } }
  ).exec();
};

export const updateSellerReview = async (data: IBuyerReviewMessageDetails): Promise<ISellerDocument | null> => {
  const ratingType: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };

  const ratingKey = ratingType[`${data.rating}`];

  //In MongoDB, you use the square brackets ([]) when you need to construct
  // dynamic field names. Without square brackets, MongoDB interprets the key
  // literally, but with square brackets, the value inside is evaluated dynamically,
  // allowing you to compute or use variables in field names.
  //with bracket --> "ratingCategories.5star.count"
  //without bracket -->"ratingCategories.${ratingKey}.count",

  return (await SellerModel.findByIdAndUpdate(
    { _id: data.sellerId },
    {
      $inc: {
        ratingCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1
      }
    }
  )) as ISellerDocument;
};
