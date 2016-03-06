/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPoints: function(req, res) {
		var page = req.query.page;
		if (typeof(page) === 'undefined') {
			page = 1;
		}
		console.log(page);
		Points.find({
				where: {
					type: 'PATRIMOINE_CULTUREL',
					// sentiment: {
					// 	'>=': sentiment_level
					// }
				},
				sort: 'sentiment DESC'
			}).paginate({ page: page, limit: 50 })
			.exec(function(err, points) {
				if (err) throw err;
				res.json(points);
			});
	},
};
