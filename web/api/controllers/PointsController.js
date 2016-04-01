/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPoints: function(req, res) {
		var limit = req.query.limit;
		var page = req.query.page;
		if (typeof(page) === 'undefined') {
			page = 1;
		}
		if (typeof(limit) === 'undefined') {
			page = 50;
		}
		PointsService.getPoints(page, limit, function(points) {
			res.json(points);
		});
	},
};
