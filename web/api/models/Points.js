/**
 * Points.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	tableName: 'interest_points',
  attributes: {
		id: {
			type: 'integer',
			unique: true,
			primaryKey: true,
			columnName: 'id'
		},
  	name:{
  		type: 'string',
  		columnName: 'nom'
  	},
  	type:{
  		type: 'string',
  		columnName: 'type'
  	},
  	latitude:{
  		type: 'string',
  		columnName: 'coordinates_lat'
  	},
  	longitude:{
  		type: 'string',
  		columnName: 'coordinates_long'
  	},
  	sentiment:{
  		type: 'integer',
  		columnName: 'sentiment'
  	},
  	createdAt:{
  		type: 'date',
  		columnName: 'date_creation'
  	},
  	updatedAt:{
  		type: 'date',
  		columnName: 'last_update'
  	}
  }
};

