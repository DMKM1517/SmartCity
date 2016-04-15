module.exports = {
	getCube: function(ip_id, source_rating, source_count, days, next) {
		var query = 'select ' +
			'd.date_id as date, ' +
			'avg(f.' + source_rating + ') as rating, ' +
			'sum(f.' + source_count + ') as count ' +
			'from ' +
			'data_warehouse.fact_ratings f ' +
			'join data_warehouse.dim_interest_points ip on f.ip_id = ip.ip_id ' +
			'join data_warehouse.dim_date d on f.date_id = d.date_id ' +
			'where ' +
			'ip.ip_id = ' + ip_id + ' ' +
			'and d.date_id between now() - interval \'' + days + '\' day and now() ' +
			'group by d.date_id, ip.ip_id ' +
			'order by d.date_id;';
		Ratings.query(query, function(err, results) {
			if (err) throw err;
			next(results.rows);
		});
	}
};
