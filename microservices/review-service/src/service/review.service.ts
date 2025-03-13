import { IReviewDocument, IReviewMessageDetails } from '@review/type/reviewType';
import { pool } from '@review/database';
import { publicFanOutMessage } from '@review/queue/review.producer';
import { reviewChannel } from '@review/server';

interface IReviewerObjectKey {
  [key: string]: string | number | Date | undefined;
}

const objKeys: IReviewerObjectKey = {
  review: 'review',
  rating: 'rating',
  country: 'country',
  gigid: 'gigId',
  reviewerid: 'reviewerId',
  createdat: 'createdAt',
  orderid: 'orderId',
  sellerid: 'sellerId',
  reviewerimage: 'reviewerImage',
  reviewerusername: 'reviewerUsername',
  reviewtype: 'reviewType'
};

export const addReview = async (data: IReviewDocument): Promise<IReviewDocument> => {
  const { gigId, reviewerId, sellerId, review, reviewerImage, rating, orderId, reviewerUsername, country, reviewType } = data;

  const createdAt = new Date();

  const { rows } = await pool.query(
    `INSERT INTO reviews(gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAt)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAt]
  );

  const message: IReviewMessageDetails = {
    gigId: data.gigId,
    reviewerId: data.reviewerId,
    sellerId: data.sellerId,
    review: data.review,
    rating: data.rating,
    orderId: data.orderId,
    createdAt: `${createdAt}`,
    type: data.reviewType
  };
  const exchangeName = 'user-review-update';

  await publicFanOutMessage(reviewChannel, exchangeName, JSON.stringify(message), 'Review details sent to order and users services');

  return Object.fromEntries(Object.entries(rows[0]).map(([key, value]) => [objKeys[key] || key, value]));
};

export const getReviewsByGigId = async (gigId: string): Promise<IReviewDocument[]> => {
  const { rows } = await pool.query('SELECT * FROM reviews WHERE reviews.gigId = $1', [gigId]);

  return rows.reduce((acc, key) => {
    const transformedKey = Object.fromEntries(Object.entries(key).map(([key, value]) => [objKeys[key] || key, value]));

    acc.push(transformedKey);
    return acc;
  }, []);
};

export const getReviewsBySellerId = async (sellerId: string): Promise<IReviewDocument[]> => {
  const { rows } = await pool.query('SELECT * FROM reviews WHERE reviews.sellerId = $1 AND reviews.reviewType = $2', [
    sellerId,
    'seller-review'
  ]);

  return rows.reduce((acc, key) => {
    const transformedKey = Object.fromEntries(Object.entries(key).map(([key, value]) => [objKeys[key] || key, value]));

    acc.push(transformedKey);
    return acc;
  }, []);
};
