/**
 * RatingsController
 *
 * @description :: Server-side logic for managing Ratings
 */

module.exports = {
	getCube: function(req, res) {
		var ip_id = req.query.ip_id;
		var source = req.query.source || 'foursquare';
		var source_rating, source_count;
		switch (source) {
			case 'foursquare':
				source_rating = 'fs_rating';
				source_count = 'fs_checkinscount';
				break;
		}
		if (ip_id && source_rating && source_count) {
			RatingsService.getCube(ip_id, source_rating, source_count, function(cube) {
				res.json(cube);
			});
		} else {
			res.badRequest();
		}
	}
};
