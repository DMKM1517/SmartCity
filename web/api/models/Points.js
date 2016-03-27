/**
 * Points.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'v_interest_points_agregated',
  // tableName: 'interest_points',
  meta: {
    schemaName: 'ip'
  },
  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      columnName: 'id'
    },
    name: {
      type: 'string',
      columnName: 'name'
    },
    category: {
      type: 'string',
      columnName: 'type'
    },
    latitude: {
      type: 'string',
      columnName: 'coordinates_lat'
    },
    longitude: {
      type: 'string',
      columnName: 'coordinates_long'
    },
    address: {
      type: 'string',
      columnName: 'addresse'
    },
    email: {
      type: 'string',
      columnName: 'email'
    },
    phone: {
      type: 'string',
      columnName: 'telephone'
    },
    web: {
      type: 'string',
      columnName: 'siteweb'
    },
    facebook: {
      type: 'string',
      columnName: 'facebook'
    },
    schedule: {
      type: 'string',
      columnName: 'ouverture'
    },
    use: {
      type: 'binary',
      columnName: 'in_use'
    },
    image: {
      type: 'string',
      columnName: 'image_url'
    },
    rating: {
      type: 'float',
      columnName: 'averagerating'
    },
    createdAt: {
      type: 'date',
      columnName: 'date_creation'
    },
    updatedAt: {
      type: 'date',
      columnName: 'last_update'
    }
  }
};
