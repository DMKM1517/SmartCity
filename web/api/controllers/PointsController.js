/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 */

module.exports = {
	getPoints: function(req, res) {
		var limit = req.query.limit || 50;
		var page = req.query.page || 1;
		PointsService.getPoints(page, limit, function(points) {
			res.json(points);
		});
	},
	getCategories: function(req, res) {
		PointsService.getCategories(function(categories) {
			res.json(categories);
		});
	},
	getCommunes: function(req, res) {
		PointsService.getCommunes(function(communes) {
			res.json(communes);
		});
	},
	search: function(req, res) {
		var q = req.query.q;
		var limit = req.query.limit || 25;
		PointsService.search(q, limit, function(results) {
			res.json(results);
		});
	},
};
