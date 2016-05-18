SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var _points = {},
		_categories = [],
		_tweets = [],
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
						if (!_points[point.id]) {
							_points[point.id] = point;
						}
					}
					sortPoints();
					pages_loaded.push(page);
					defer.resolve(_points);
				} else {
					defer.reject('no data');
				}
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(_points);
		}
		return defer.promise;
	};

	// get a point by id
	this.getPoint = function(id) {
		var defer = $q.defer();
		if (!_points[id]) {
			$http.get('/points/' + id).success(function(point) {
				if (!_points[point.id]) {
					_points[point.id] = point;
					sortPoints();
				}
				if (!point.rating) {
					point.rating = 0;
				}
				defer.resolve(point);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			if (!_points[id].rating) {
				_points[id].rating = 0;
			}
			defer.resolve(_points[id]);
		}
		return defer.promise;
	};

	// get a tweets of a point using its id
	this.getTweetsOfPoint = function(id) {
		var defer = $q.defer();
		if (!_tweets[id]) {
			$http.get('/points/getTweetsOfPoint?id=' + id).success(function(tweetsOfPoint) {
				_tweets[id] = tweetsOfPoint;
				defer.resolve(_tweets[id]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(_tweets[id]);
		}
		return defer.promise;
	};

	// get all categories
	this.getCategories = function() {
		var defer = $q.defer();
		if (_categories.length === 0) {
			$http.get('/points/getCategories').success(function(categories) {
				_categories = categories;
				defer.resolve(_categories);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(_categories);
		}
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

	// filter by category all points or just the ids_to_filter
	this.filter = function(selected_categories, show_only_top, ids_to_filter) {
		var filtered = [],
			point,
			i;
		if (ids_to_filter) {
			for (i in ids_to_filter) {
				point = _points[ids_to_filter[i]];
				if (selected_categories[point.category]) {
					if (!show_only_top || point.rating >= 4) {
						filtered.push(point.id);
					}
				}
			}
		} else {
			for (i in _points) {
				point = _points[i];
				if (selected_categories[point.category]) {
					if (!show_only_top || point.rating >= 4) {
						filtered.push(point.id);
					}
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
				point_name = _points[keys_sorted[i]].name;
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
			var resp = {},
				new_points = [];
			$http.get('/points/search?q=' + query).success(function(data) {
				for (var i in data) {
					point = data[i];
					results.push({ id: point.id, name: point.name });
					if (!_points[point.id]) {
						_points[point.id] = point;
						new_points.push(point);
					}
				}
				sortPoints();
				resp.results = results;
				resp.new_points = new_points;
				defer.resolve(resp);
			});
		}
		return defer.promise;
	};

	function sortPoints() {
		keys_sorted = Object.keys(_points).sort(function(x, y) {
			return _points[x].rating < _points[y].rating ? 1 : -1;
		});
	}

}]);
