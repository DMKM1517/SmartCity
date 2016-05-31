SmartApp.service('PointsService', ['$http', '$q', '$timeout', 'localStorageService', function($http, $q, $timeout, localStorageService) {
	var _points = {},
		_categories = [],
		_tweets = [],
		_keys_sorted = [],
		_pages_loaded = [],
		_history = {},
		_all_history = {};

	// get points by page with limit
	this.getPoints = function(page, limit) {
		var defer = $q.defer(),
			local_storage = angular.fromJson(localStorageService.get('points'));
		if (_pages_loaded.indexOf(page) == -1) {
			if (local_storage && Object.keys(local_storage).length >= limit) {
				_points = local_storage;
				sortPoints();
				defer.resolve(_points);
			} else {
				$http.get('/points/getPoints?page=' + (page + 1) + '&limit=' + limit).success(function(data) {
					if (data) {
						for (var i in data) {
							point = data[i];
							if (!_points[point.id]) {
								_points[point.id] = point;
							}
						}
						sortPoints();
						_pages_loaded.push(page);
						localStorageService.set('points', angular.toJson(_points));
						defer.resolve(_points);
					} else {
						defer.reject('no data');
					}
				}).error(function(err) {
					defer.reject(err);
				});
			}
		} else {
			defer.resolve(_points);
		}
		return defer.promise;
	};

	// get a point by id
	this.getPoint = function(id) {
		var defer = $q.defer(),
			resolved = false,
			local_storage;
		if (!_points[id]) {
			local_storage = angular.fromJson(localStorageService.get('points'));
			if (local_storage) {
				if (Object.keys(_points).length === 0) {
					_points = local_storage;
					if (_points[id]) {
						defer.resolve(_points[id]);
						resolved = true;
					}
				}
			}
			if (!resolved) {
				$http.get('/points/' + id).success(function(point) {
					if (!_points[point.id]) {
						_points[point.id] = point;
						if (!_points[id].rating) {
							_points[id].rating = 0;
						}
						localStorageService.set('points', angular.toJson(_points));
						sortPoints();
					}
					defer.resolve(_points[id]);
				}).error(function(err) {
					defer.reject(err);
				});
			}
		} else {
			if (!_points[id].rating) {
				_points[id].rating = 0;
			}
			defer.resolve(_points[id]);
		}
		return defer.promise;
	};

	// get tweets of a point using its id
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
			url = '/ratings/getHistory?source=' + source + '&days=35&ip_id=' + id;
		if (!_history[id]) {
			$http.get(url).success(function(data) {
				_history = {};
				_history[id] = {};
				_history[id][source] = data;
				defer.resolve(_history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else if (!_history[id][source]) {
			$http.get(url).success(function(data) {
				_history[id][source] = data;
				defer.resolve(_history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(_history[id][source]);
		}
		return defer.promise;
	};

	// get history of all sources
	this.getAllHistory = function(id, days) {
		var defer = $q.defer(),
			url = '/ratings/getAllHistory?ip_id=' + id + '&days=' + days;
		if (!_all_history[id]) {
			$http.get(url).success(function(data) {
				_all_history[id] = data;
				defer.resolve(_all_history[id]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(_all_history[id]);
		}
		return defer.promise;
	};

	// search in the local stored points or in the server 
	this.search = function(query, local) {
		var defer = $q.defer(),
			results = [],
			count = 0,
			max_length = 29,
			point_name,
			index,
			start,
			result;
		defer.promise.abort = function() {
			defer.resolve();
		};
		query = removeDiacritics(query.trim().toLowerCase());
		if (local) {
			// search local stored points
			for (var i = 0; i < _keys_sorted.length && count < 10; i++) {
				point_name = _points[_keys_sorted[i]].name;
				index = removeDiacritics(point_name.toLowerCase()).indexOf(query);
				if (index != -1) { // result found
					count++;
					result = point_name;
					// if the name is too long, get the part that contains the query
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
					results.push({
						label: result,
						name: point_name
					});
				}
			}
			defer.resolve(results);
		} else {
			// search in server
			var resp = {},
				prev_results = [],
				new_points = [],
				count = 0,
				max_results = 30;
			// timeout to be able to notify the prev results
			$timeout(function() {
				for (var i = 0; i < _keys_sorted.length && count < max_results; i++) {
					point_name = _points[_keys_sorted[i]].name;
					index = removeDiacritics(point_name.toLowerCase()).indexOf(query);
					if (index != -1) {
						count++;
						prev_results.push(_points[_keys_sorted[i]]);
					}
				}
				// notify the results from the local stored points
				defer.notify(prev_results);
			}, 10);
			// double apostrophes for querying in postgresql
			query2 = query.split("'").join("''");
			// call to the server
			$http.get('/points/search?q=' + query2 + '&limit=' + max_results).success(function(data) {
				for (var i in data) {
					point = data[i];
					// results for display
					results.push({
						id: point.id,
						name: point.name
					});
					// store locally new points found
					if (!_points[point.id]) {
						_points[point.id] = point;
						new_points.push(point);
					}
				}
				if (new_points.length > 0) {
					localStorageService.set('points', angular.toJson(_points));
				}
				// sort by rating including the new points
				sortPoints();
				resp.results = results;
				resp.new_points = new_points;
				defer.resolve(resp);
			});
		}
		return defer.promise;
	};

	// sort points by rating
	function sortPoints() {
		_keys_sorted = Object.keys(_points).sort(function(x, y) {
			return _points[x].rating < _points[y].rating ? 1 : -1;
		});
	}

}]);