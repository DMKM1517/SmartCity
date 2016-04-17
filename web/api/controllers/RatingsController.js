/**
 * RatingsController
 *
 * @description :: Server-side logic for managing Ratings
 */

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
				for(var i in history){
					history[i].rating = parseFloat(+history[i].rating.toFixed(2));
					history[i].count = parseInt(history[i].count);
				}
				res.json(history);
			});
		} else {
			res.badRequest();
		}
	}
};
