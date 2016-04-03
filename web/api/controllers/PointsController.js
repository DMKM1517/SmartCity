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
		if (!page) {
			page = 1;
		}
		if (!limit) {
			limit = 50;
		}
		PointsService.getPoints(page, limit, function(points) {
			res.json(points);
		});
	},
	getCategories: function(req, res) {
		PointsService.getCategories(function(categories) {
			res.json(categories);
		});
	}
};
