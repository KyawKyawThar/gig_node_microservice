import { getDocumentByID, getGigsBySearch } from '@auth/elasticSearch';
import { IPaginateProps, IQueryList, ISearchResult, ISellerGig } from '@auth/types/authTypes';

export async function gigByID(index: string, gigID: string): Promise<ISellerGig> {
  const gig = getDocumentByID(index, gigID);
  return gig;
}

export async function gigBySearch(
  searchQuery: string,
  paginate: IPaginateProps,
  deliveryTime?: string,
  min?: number,
  max?: number
): Promise<ISearchResult> {
  const { from, size, type } = paginate;

  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
        query: `**${searchQuery}**`
      }
    },
    {
      term: {
        active: true
      }
    }
  ];

  if (deliveryTime !== 'undefined') {
    queryList.push({
      query_string: {
        fields: ['expectedDelivery'],
        query: `*${deliveryTime}*`
      }
    });
  }

  if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min,
          lte: max
        }
      }
    });
  }

  const result = await getGigsBySearch('gigs', queryList, type, size, from);
  return {
    hits: result.hits,
    total: result.total
  };
}
