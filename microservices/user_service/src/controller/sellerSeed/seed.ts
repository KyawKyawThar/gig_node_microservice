import { NextFunction, Request, Response } from 'express';
import { getRandomBuyer } from '@user/services/buyer.service';
import { IEducation, IExperience, ISellerDocument } from '@user/types/sellerTypes';
import { createSeller, getSellerByEmail } from '@user/services/seller.service';
import { BadRequestError, NotFoundError } from '@user/errorHandler';
import { faker } from '@faker-js/faker/locale/ar';
import { v4 as uuidv4 } from 'uuid';
import { parseInt, random, sample, sampleSize } from 'lodash';
import { StatusCodes } from 'http-status-codes';

export async function seed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const buyers = await getRandomBuyer(parseInt(req.params.count, 10));

    if (!buyers.length) {
      throw new NotFoundError('Buyer not found for seed', 'SellerSeed seller() method error');
    }

    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i];

      const checkIsSellerExists = await getSellerByEmail(buyer.email);

      if (checkIsSellerExists) {
        throw new BadRequestError('Seller already exist.', 'SellerSeed seller() method error');
      }
      const skills: string[] = [
        'Programming',
        'Web development',
        'Mobile development',
        'Proof reading',
        'UI/UX',
        'Data Science',
        'Financial modeling',
        'Data analysis'
      ];

      const basicDescription: string = faker.commerce.productDescription();

      const seller = {
        profilePublicID: uuidv4(),
        fullName: faker.person.fullName(),
        userName: buyer.username,
        email: buyer.email,
        profilePicture: buyer.profilePicture,
        description: basicDescription.length <= 250 ? basicDescription : basicDescription.slice(0, 250),
        onliner: faker.word.words({ count: { min: 5, max: 10 } }),
        country: faker.location.country(),
        skills: sampleSize(skills, sample([1, 4])),
        languages: [
          { language: 'English', level: 'Native' },
          { language: 'French', level: 'Basic' },
          { language: 'German', level: 'Basic' }
        ],
        responseTime: parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }), 10),
        experience: randomExperience(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
        educations: randomEducation(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
        socialLinks: ['https://kickchatapp.com', 'http://youtube.com', 'https://facebook.com'],
        certificates: [
          {
            name: 'Flutter App Developer',
            from: 'Flutter Academy',
            to: 2021
          },
          {
            name: 'Android App Developer',
            from: '2019',
            to: 2020
          },
          {
            name: 'IOS App Developer',
            from: 'Apple Inc.',
            to: 2019
          }
        ]
      } as ISellerDocument;
      //Flutter Academy
      //certificates.2.from
      await createSeller(seller);
    }
    res.status(StatusCodes.CREATED).json({ message: 'Sellers created successfully' });
  } catch (error) {
    next(error);
  }
}

const randomExperience = (count: number): IExperience[] => {
  const result: IExperience[] = [];
  const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025];

  const randomEndYear = ['Present', '2024', '2025', '2026', '2027'];
  const endYear = randomEndYear[random(0, randomEndYear.length - 1)];

  for (let i = 0; i < count; i++) {
    const experience: IExperience = {
      company: faker.company.name(),
      title: faker.person.jobTitle(),
      startDate: `${faker.date.month()} ${randomStartYear[random(0, randomStartYear.length - 1)]}`,
      endDate: endYear === 'Present' ? 'Present' : `${faker.date.month()} ${endYear}`,
      description: faker.commerce.department().slice(0, 100),
      currentlyWorkingHere: endYear === 'Present'
    };
    result.push(experience);
  }
  return result;
};

const randomEducation = (count: number): IEducation[] => {
  const result: IEducation[] = [];

  const endYear = [2020, 2021, 2022, 2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const education: IEducation = {
      country: faker.location.country(),
      title: faker.person.jobTitle(),
      university: faker.person.jobTitle(),
      major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
      year: `${endYear[random(0, endYear.length - 1)]}`
    };
    result.push(education);
  }

  return result;
};
