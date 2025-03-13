import { IBuyerReviewMessageDetails, IRatingTypes, ISellerDocument, ISellerGig } from '@gig/types/gigTypes';
import { config } from '@gig/config';
import { addIndexData, deleteIndexData, getIndexData, updateIndexData } from '@gig/elasticSearch';
import { gigSearchBySellerId } from './search.service';
import { GigModel } from 'model/gig.schema';
import { publicDirectMessage } from '@gig/queue/gig.producer';
import { gigChannel } from '@gig/server';
import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

export const getGigByID = async (gigID: string): Promise<ISellerGig> => {
  return await getIndexData(config.GIGS, gigID);
};

export const getSellerGig = async (sellerID: string): Promise<ISellerGig[]> => {
  const sellerGig = await gigSearchBySellerId(sellerID, true);

  return sellerGig.hits.map((hit) => hit._source as ISellerGig);
};

export const getPauseSellerGig = async (sellerID: string): Promise<ISellerGig[]> => {
  const sellerGig = await gigSearchBySellerId(sellerID, false);
  return sellerGig.hits.map((hit) => hit._source as ISellerGig);
};

export const createGig = async (gigs: ISellerGig): Promise<ISellerGig> => {
  const createGig = await GigModel.create(gigs);

  if (createGig) {
    const gigData = createGig.toJSON() as ISellerGig;

    //important connection with user service
    await publicDirectMessage(
      gigChannel,
      'user-seller-update',
      'user-seller',
      JSON.stringify({ type: 'update-gig-count', sellerId: gigData.id, count: 1 }),
      'Details send to users service'
    );

    await addIndexData(config.GIGS, createGig._id, gigData);
  }

  return createGig;
};

export const updateGig = async (gigData: ISellerGig, gigId: string): Promise<ISellerGig> => {
  const document = (await GigModel.findByIdAndUpdate(
    { _id: gigId },
    {
      $set: {
        title: gigData.title,
        description: gigData.description,
        categories: gigData.categories,
        subCategories: gigData.subCategories,
        tags: gigData.tags,
        price: gigData.price,
        coverImage: gigData.coverImage,
        expectedDelivery: gigData.expectedDelivery,
        basicTitle: gigData.basicTitle,
        basicDescription: gigData.basicDescription
      }
    },
    {
      new: true
    }
  )) as ISellerGig;
  if (document) {
    const gigData = document.toJSON?.() as ISellerGig;
    await updateIndexData(config.GIGS, gigId, gigData!);
  }
  return document;
};

export const updateGigReview = async (data: IBuyerReviewMessageDetails): Promise<ISellerGig> => {
  const ratingType: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };

  const ratingKey = ratingType[data.rating!];

  const document = (await GigModel.findByIdAndUpdate(
    { _id: data.gigId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories${ratingKey}.value`]: data.rating,
        [`ratingCategories${ratingKey}.count`]: 1
      }
    },
    { new: true, upsert: true }
  )) as ISellerGig;

  if (document) {
    const updateGig = document.toJSON?.() as ISellerGig;
    await updateIndexData(config.GIGS, updateGig.id!, updateGig);
  }
  return document;
};

export const updateActiveGig = async (gigId: string, active: boolean): Promise<ISellerGig> => {
  const updateActiveGig = (await GigModel.findByIdAndUpdate(
    { _id: gigId },
    {
      $set: {
        active
      }
    },
    { new: true }
  )) as ISellerGig;

  console.log(updateActiveGig);

  if (updateActiveGig) {
    const gigData = updateActiveGig.toJSON?.() as ISellerGig;
    await updateIndexData(config.GIGS, gigId, gigData);
  }
  return updateActiveGig;
};

export const deleteGigById = async (gigId: string, sellerId: string): Promise<ISellerGig> => {
  const result = (await GigModel.findByIdAndDelete({ _id: gigId })) as ISellerGig;

  if (!result) {
    return result;
  }
  await publicDirectMessage(
    gigChannel,
    'user-seller-update',
    'user-seller',
    JSON.stringify({ type: 'update-gig-count', sellerId, count: -1 }),
    'Details send to users service'
  );
  await deleteIndexData(config.GIGS, gigId);

  return result;
};
export const gigSeedData = async (seller: ISellerDocument[], count: string): Promise<void> => {
  const categories: string[] = [
    'Graphics & Design',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Data',
    'Business'
  ];
  const expectedDelivery: string[] = ['1 Day Delivery', '2 Days Delivery', '3 Days Delivery', '4 Days Delivery', '5 Days Delivery'];

  const randomRatings = [
    { sum: 20, count: 4 },
    { sum: 10, count: 2 },
    { sum: 20, count: 4 },
    { sum: 15, count: 3 },
    { sum: 5, count: 1 }
  ];
  for (let i = 0; i < seller.length; i++) {
    const sellerDoc = seller[i];
    const title = `I will ${faker.word.words(5)}`;
    const basicTitle = faker.commerce.productName();
    const basicDescription = faker.commerce.productDescription();
    const rating = sample(randomRatings);
    const gig: ISellerGig = {
      sellerId: sellerDoc._id,
      username: sellerDoc.fullName,
      title: title.length <= 80 ? title : title.slice(0, 80),
      basicDescription: basicDescription.length <= 100 ? basicDescription : basicDescription.slice(0, 100),
      basicTitle: basicTitle.length <= 40 ? basicTitle : basicTitle.slice(0, 40),
      profilePicture: sellerDoc.profilePicture,
      email: sellerDoc.email,
      categories: `${sample(categories)}`,
      subCategories: [faker.commerce.department(), faker.commerce.department(), faker.commerce.department()],
      description: faker.lorem.sentences({ min: 2, max: 4 }),
      tags: [faker.commerce.product(), faker.commerce.product(), faker.commerce.product(), faker.commerce.product()],
      price: parseInt(faker.commerce.price({ min: 20, max: 30, dec: 0 })),
      coverImage: faker.image.urlPicsumPhotos(),
      expectedDelivery: `${sample(expectedDelivery)}`,
      sortId: parseInt(count, 10) + i + 1,
      ratingsCount: (i + 1) % 4 === 0 ? rating!['count'] : 0,
      ratingSum: (i + 1) % 4 === 0 ? rating!['sum'] : 0
    };
    console.log(`***SEEDING GIG*** - ${i + 1} of ${count}`);

    const data = await createGig(gig);

    await addIndexData(config.GIGS, data.id!, data);
  }
};
