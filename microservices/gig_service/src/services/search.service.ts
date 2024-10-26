import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@gig/config';
import { elasticSearchClient } from '@gig/elasticSearch';
import { IHitTotal, IPaginateProps, IQueryList, ISearchResult } from '@gig/types/gigTypes';

export const gigSearchBySellerId = async (searchQuery: string, active: boolean): Promise<ISearchResult> => {
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['sellerId'],
        query: `${searchQuery}`
      }
    },
    {
      term: { active }
    }
  ];

  const searchResult = await elasticSearchClient.search({
    index: config.GIGS,
    query: {
      bool: { must: [...queryList] }
    }
  });
  const total = searchResult.hits.total as IHitTotal;
  return {
    hits: searchResult.hits.hits,
    total: total.value
  };
};

export const gigsSearchByCategory = async (searchQuery: string): Promise<ISearchResult> => {
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['category'],
        query: `${searchQuery}`
      }
    },
    { term: { active: true } }
  ];

  const { hits } = await elasticSearchClient.search({
    index: config.GIGS,
    query: {
      bool: { must: [...queryList] }
    }
  });

  const total = hits.total as IHitTotal;

  return {
    hits: hits.hits,
    total: total.value
  };
};

export const gigsSearch = async (
  searchQuery: string,
  paginate: IPaginateProps,
  deliveryTime?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<ISearchResult> => {
  const { from, size, type } = paginate;
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
        query: `*${searchQuery}*`
      }
    },
    { term: { active: true } }
  ];

  if (deliveryTime !== undefined) {
    queryList.push({
      query_string: {
        fields: ['expectedDelivery'],
        query: `*${deliveryTime}*`
      }
    });
  }

  if (!isNaN(parseInt(`${minPrice}`)) && !isNaN(parseInt(`${maxPrice}`))) {
    queryList.push({
      range: {
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      }
    });
  }

  const result: SearchResponse = await elasticSearchClient.search({
    index: config.GIGS,
    size,
    query: {
      bool: {
        must: [...queryList]
      }
    },
    sort: [
      {
        sortId: type === 'forward' ? 'asc' : 'desc'
      }
    ],
    ...(from !== '0' && { search_after: [from] })
  });

  const total = result.hits.total as IHitTotal;

  return {
    hits: result.hits.hits,
    total: total.value
  };
};

export const getMoreGigsLikeThis = async (gigId: string): Promise<ISearchResult> => {
  const result: SearchResponse = await elasticSearchClient.search({
    index: config.GIGS,
    size: 5,
    query: {
      more_like_this: {
        fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
        like: [
          {
            _id: gigId,
            _index: config.GIGS
          }
        ],
        min_term_freq: 1,
        max_query_terms: 12
      }
    }
  });

  const total = result.hits.total as IHitTotal;

  return {
    hits: result.hits.hits,
    total: total.value
  };
};

export const getTopGigsByCategory = async (searchQuery: string): Promise<ISearchResult> => {
  const result: SearchResponse = await elasticSearchClient.search({
    index: config.GIGS,
    size: 10,
    query: {
      bool: {
        filter: {
          script: {
            script: {
              source: "doc['ratingSum'].value != 0 && (doc['ratingSum'].value / doc['ratingsCount'].value == params['threshold'])",
              lang: 'painless',
              params: {
                threhold: 5
              }
            }
          }
        },
        must: [
          {
            query_string: {
              fields: ['category'],
              query: `*${searchQuery}*`
            }
          }
        ]
      }
    }
  });

  const total = result.hits.total as IHitTotal;

  return {
    hits: result.hits.hits,
    total: total.value
  };
};
