SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var points = {},
		keys_sorted = [],
		pages_loaded = [],
		history = {},
		all_history = {};

	// get points by page with limit
	this.getPoints = function(page, limit) {
		var defer = $q.defer();
		if (pages_loaded.indexOf(page) == -1) {
			$http.get('/points/getPoints?page=' + (page + 1) + '&limit=' + limit).success(function(data) {
				if (data) {
					for (var i in data) {
						point = data[i];
						if (!points[point.id]) {
							points[point.id] = point;
						}
					}
					sortPoints();
					pages_loaded.push(page);
					defer.resolve(points);
				} else {
					defer.reject('no data');
				}
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points);
		}
		return defer.promise;
	};

	// get a point by id
	this.getPoint = function(id) {
		var defer = $q.defer();
		if (!points[id]) {
			$http.get('/points/' + id).success(function(point) {
				if (!points[point.id]) {
					points[point.id] = point;
					sortPoints();
				}
				defer.resolve(point);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points[id]);
		}
		return defer.promise;
	};

	// get all categories
	this.getCategories = function() {
		var defer = $q.defer();
		$http.get('/points/getCategories').success(function(categories) {
			defer.resolve(categories);
		}).error(function(err) {
			defer.reject(err);
		});
		return defer.promise;
	};

	// get all communes
	this.getCommunes = function() {
		var defer = $q.defer();
		$http.get('/points/getCommunes').success(function(communes) {
			defer.resolve(communes);
		}).error(function(err) {
			defer.reject(err);
		});
		return defer.promise;
	};

	// filter by category
	this.filterCategories = function(selected_categories, show_only_top) {
		var filtered = [],
			point;
		for (var i in points) {
			point = points[i];
			if (selected_categories[point.category]) {
				if (!show_only_top || point.rating >= 4) {
					filtered.push(point.id);
				}
			}
		}
		return filtered;
	};

	// history
	this.getHistory = function(id, source) {
		var defer = $q.defer(),
			url = '/ratings/getHistory?source=' + source + '&days=30&ip_id=' + id;
		if (!history[id]) {
			$http.get(url).success(function(data) {
				history = {};
				history[id] = {};
				history[id][source] = data;
				defer.resolve(history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else if (!history[id][source]) {
			$http.get(url).success(function(data) {
				history[id][source] = data;
				defer.resolve(history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(history[id][source]);
		}
		return defer.promise;
	};


	this.getAllHistory = function(id, days) {
		var defer = $q.defer(),
			url = '/ratings/getAllHistory?ip_id=' + id + '&days=' + days;
		if (!all_history[id]) {
			$http.get(url).success(function(data) {
				all_history[id] = data;
				defer.resolve(all_history[id]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(all_history[id]);
		}
		return defer.promise;
	};

	this.search = function(query, local) {
		var defer = $q.defer(),
			results = [],
			count = 0,
			max_length = 29,
			point_name,
			index,
			start,
			result;
		query = removeDiacritics(query.trim().toLowerCase());
		if (local) {
			for (var i = 0; i < keys_sorted.length && count <= 10; i++) {
				point_name = points[keys_sorted[i]].name;
				index = removeDiacritics(point_name.toLowerCase()).indexOf(query);
				if (index != -1) {
					count++;
					result = point_name;
					if (point_name.length > max_length) {
						result = '';
						start = Math.max(0, index - Math.round((max_length - query.length) / 2));
						if (start > 0) {
							result += '...';
						}
						result += point_name.substr(start, max_length);
						if (point_name.length > start + max_length) {
							result += '...';
						}
					}
					results.push({ label: result, name: point_name });
				}
			}
			defer.resolve(results);
		} else {
			$http.get('/points/search?q=' + query).success(function(data) {
				for (var i in data) {
					point = data[i];
					results.push({ id: point.id, name: point.name });
					if (!points[point.id]) {
						points[point.id] = point;
					}
				}
				sortPoints();
				defer.resolve(results);
			});
		}
		return defer.promise;
	};

	function sortPoints() {
		keys_sorted = Object.keys(points).sort(function(x, y) {
			return points[x].rating < points[y].rating ? 1 : -1;
		});
	}

}]);
