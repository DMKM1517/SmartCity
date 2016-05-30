/**
 * RatingsController
 *
 * @description :: Server-side logic for managing Ratings
 */

/*jshint esversion: 6 */

module.exports = {
	getHistory: function(req, res) {
		var ip_id = req.query.ip_id;
		var source = req.query.source || 'foursquare';
		var days = req.query.days || 7;
		var source_rating, source_count;
		switch (source) {
			case 'twitter':
				source_rating = 'twitter_sentiment';
				source_count = 'twitter_count';
				break;
			case 'foursquare':
				source_rating = 'fs_rating';
				source_count = 'fs_checkinscount';
				break;
			case 'yelp':
				source_rating = 'yelp_rating';
				source_count = 'yelp_review_count';
				break;
		}
		if (ip_id && source_rating && source_count && days) {
			RatingsService.getCube(ip_id, source_rating, source_count, days, function(history) {
				for (var i in history) {
					if (history[i].rating) {
						history[i].rating = parseFloat(+history[i].rating.toFixed(2));
					} else {
						history[i].rating = 0;
					}
					history[i].count = parseInt(history[i].count);
				}
				res.json(history);
			});
		} else {
			res.badRequest();
		}
	},
	getAllHistory: function(req, res) {
		"use strict";
		var ip_id = req.query.ip_id;
		var days = req.query.days || 7;
		if (ip_id && days) {
			RatingsService.getAllCube(ip_id, days, function(history) {
				for (let h of history) {
					if (h.twitter_rating) {
						h.twitter_rating = parseFloat(+h.twitter_rating.toFixed(2));
					} else {
						h.twitter_rating = 0;
					}
					if (h.foursquare_rating) {
						h.foursquare_rating = parseFloat((+h.foursquare_rating / 2).toFixed(2));
					} else {
						h.foursquare_rating = 0;
					}
					if (h.yelp_rating) {
						h.yelp_rating = parseFloat(+h.yelp_rating.toFixed(2));
					} else {
						h.yelp_rating = 0;
					}
				}
				res.json(history);
			});
		} else {
			res.badRequest();
		}
	},
	forecast: function(req, res) {
		"use strict";
		let nostradamus = require('nostradamus'),
			data = req.body.data,
			alpha = req.body.alpha || 0.1,
			beta = req.body.beta || 0.4,
			gamma = req.body.gamma || 0.1,
			period = req.body.period || 7,
			future = req.body.future || 7,
			predictions = [];
		predictions = nostradamus(data, alpha, beta, gamma, period, future);
		res.json(predictions);
	}
};