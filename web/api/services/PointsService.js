/*jshint esversion: 6 */

module.exports = {
	getPoints: function(page, limit, next) {
		Points.find({
				where: {
					rating: {
						not: null
					}
				},
				sort: 'rating DESC'
			}).paginate({ page: page, limit: limit })
			.exec(function(err, points) {
				if (err) throw err;
				next(points);
			});
	},
	getCategories: function(next) {
		Points.query('SELECT type AS category, count(*) FROM ip.v_interest_points_agregated GROUP BY type;', function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	},
	getCommunes: function(next) {
		Points.query('SELECT commune AS name, coordinates_lat AS latitude, coordinates_long AS longitude FROM data_warehouse.dim_location;', function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	},
	getTweetsOfPoint: function(id, next) {
		var query = `
			select
			 	ip_id as id,
				idd as tweet_id,
				"timestamp",
				usert as user,
				"text",
				sentiment
			from
				twitter.current_tweets_of_ip
			where
				ip_id = ${id}
			order by timestamp::timestamp desc
			limit 10;`;

		Points.query(query, function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	},
	search: function(q, limit, next) {
		"use strict";
		var query = `
			SELECT
				id,
		    name,
		    type as category,
		    coordinates_lat as latitude,
		    coordinates_long as longitude,
		    address,
		    email,
		    telephone as phone,
		    website as web,
		    facebook,
		    open_hours as schedule,
		    image_url as image,
		    average_rating as rating,
		    source_create_date as create_date,
		    last_update_date as update_date,
		    commune
			FROM ip.v_interest_points_agregated
			WHERE lower(unaccent(ip.v_interest_points_agregated.name)) like '%${q}%'
			ORDER BY average_rating DESC NULLS LAST
			LIMIT ${limit};
		`;
		Points.query(query, function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	}
};
