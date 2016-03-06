/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPoints: function(req, res) {
		var sentiment_level;
		var zoom_level = req.query.zoom | 12;
		if (zoom_level <= 12) {
			sentiment_level = '4';
		} else if (zoom_level <= 14) {
			sentiment_level = '2';
		} else if (zoom_level <= 16) {
			sentiment_level = '0';
		} else {
			sentiment_level = '-5';
		}
		console.log(sentiment_level);
		Points.find({
			where: {
				sentiment: {
					'>=': sentiment_level
				}
			},
			// sort: 'id DESC'
			// sort: 'sentiment DESC'
		}).limit(100).exec(function(err, points) {
			if (err) throw err;
			res.json(points);
		});
	},
};
