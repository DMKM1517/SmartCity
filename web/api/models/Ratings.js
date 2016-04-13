/**
 * Ratings.js
 *
 * @description :: Model for Ratings. Fact table of the data warehouse.
 */

module.exports = {
  tableName: 'fact_ratings',
  meta: {
    schemaName: 'data_warehouse'
  },
  attributes: {
    ip_id: {
      type: 'integer',
      primaryKey: true,
      columnName: 'ip_id'
    },
    date_id: {
      type: 'date',
      primaryKey: true,
      columnName: 'date_id'
    },
    location_id: {
      type: 'integer',
      primaryKey: true,
      columnName: 'location_id'
    },
    yelp_rating: {
      type: 'float',
      columnName: 'yelp_rating'
    },
    yelp_count: {
      type: 'integer',
      columnName: 'yelp_count'
    },
    fs_rating: {
      type: 'float',
      columnName: 'fs_rating'
    },
    fs_count: {
      type: 'integer',
      columnName: 'fs_checkinscount'
    },
    twitter_rating: {
      type: 'string',
      columnName: 'twitter_sentiment'
    }
  }
};
