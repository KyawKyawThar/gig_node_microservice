import { IBuyerDocument } from '@user/types/sellerTypes';
import { BuyerModel } from '@user/model/buyer.schema';

export const getUserByEmail = async (email: string): Promise<IBuyerDocument | null> => {
  return (await BuyerModel.findOne({ email }).exec()) as IBuyerDocument;
};

export const getUserByUsername = async (username: string): Promise<IBuyerDocument | null> => {
  return (await BuyerModel.findOne({ username }).exec()) as IBuyerDocument;
};

export const createBuyer = async (buyer: IBuyerDocument): Promise<IBuyerDocument | null> => {
  const checkIfBuyerExists: IBuyerDocument | null = await getUserByEmail(buyer.email);

  if (!checkIfBuyerExists) {
    return (await BuyerModel.create(buyer)) as IBuyerDocument;
  }
  return null;
};

export const getRandomBuyer = async (count: number): Promise<IBuyerDocument[]> => {
  return (await BuyerModel.aggregate([{ $sample: { size: count } }])) as IBuyerDocument[];
};

export const updateBuyerIsSellerProp = async (email: string): Promise<IBuyerDocument | null> => {
  const updateSeller = await BuyerModel.updateOne(
    { email },
    {
      $set: {
        isBuyer: true
      }
    }
  ).exec();

  return updateSeller as unknown as IBuyerDocument;
};

export const updateBuyerPurchasedGigsProp = async (
  buyerId: string,
  purchasedGigId: string,
  type: string
): Promise<IBuyerDocument | null> => {
  //console.log('updateBuyerPurchasedGigsProp.', buyerId, purchasedGigId);

  const updatePurchasedGigs = await BuyerModel.updateOne(
    { _id: buyerId },
    type === 'purchased-gigs'
      ? {
          $push: {
            purchasedGigs: purchasedGigId
          }
        }
      : {
          $pull: {
            purchasedGigs: purchasedGigId
          }
        }
  ).exec();

  return updatePurchasedGigs as unknown as IBuyerDocument;
};
