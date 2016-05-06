SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var points = {},
		pages_loaded = [],
		history = {},
		all_history = {};

	// get points by page with limit
	this.getPoints = function(page, limit) {
		var ini = page * limit;
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
					pages_loaded.push(page);
					defer.resolve(points);
					// defer.resolve(points.slice(ini, ini + limit));
				} else {
					defer.reject('no data');
				}
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points);
			// defer.resolve(points.slice(ini, ini + limit));
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
	this.filterCategories = function(selected_categories) {
		var filtered = [];
		for (var i in points) {
			var point = points[i];
			if (selected_categories[point.category]) {
				filtered.push(point.id);
			}
		}
		return filtered;
	};

	// history
	this.getHistory = function(id, source) {
		var defer = $q.defer();
		var url = '/ratings/getHistory?source=' + source + '&days=30&ip_id=' + id;
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

}]);