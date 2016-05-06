module.exports = {
	getPoints: function(page, limit, next) {
		Points.find({
				where: {
					rating: {
						not: null
					}
				},
				sort: 'rating DESC'
			}).paginate({ page: page, limit: limit })
			.exec(function(err, points) {
				if (err) throw err;
				next(points);
			});
	},
	getCategories: function(next) {
		Points.query('SELECT type AS category, count(*) FROM ip.v_interest_points_agregated GROUP BY type;', function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	},
	getCommunes: function(next) {
		Points.query('SELECT commune AS name, coordinates_lat AS latitude, coordinates_long AS longitude FROM data_warehouse.dim_location;', function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	}
};
