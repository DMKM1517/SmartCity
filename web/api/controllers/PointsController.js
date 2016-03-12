/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPoints: function(req, res) {
		var limit = 50;
		var page = req.query.page;
		if (typeof(page) === 'undefined') {
			page = 1;
		}
		PointsService.getPoints(page, limit, function(points) {
			res.json(points);
		});
	},
};
