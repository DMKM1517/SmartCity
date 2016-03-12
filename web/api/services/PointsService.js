module.exports = {
	getPoints: function(page, limit, next) {
		Points.find({
				where: {
					use: 1
					// type: 'PATRIMOINE_CULTUREL',
					// sentiment: {
					// 	'>=': sentiment_level
					// }
				},
				sort: 'sentiment DESC'
			}).paginate({ page: page, limit: limit })
			.exec(function(err, points) {
				if (err) throw err;
				next(points);
			});
	}
};