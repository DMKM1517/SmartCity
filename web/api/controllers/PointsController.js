/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getPoints: function(req, res) {
		Points.find({
			sentiment:{
				'>=':'4'
			}
		}).limit(50).exec(function(err, points) {
			if (err) throw err;
			res.json(points);
		});
	},
};

