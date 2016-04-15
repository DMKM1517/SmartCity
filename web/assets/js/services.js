/* PointsService */
SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var points = {};
	var pages_loaded = [];

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
	this.getHistory = function(id) {
		var defer = $q.defer();
		$http.get('/ratings/getHistory?source=foursquare&ip_id=' + id).success(function(data) {
			defer.resolve(data);
		}).error(function(err) {
			defer.reject(err);
		});
		return defer.promise;
	};

}]);
/* --PointsService-- */


/* GoogleMaps */
SmartApp.factory('GoogleMaps', ['colorsCnst', function(colorsCnst) {
	return {
		createMap: function(element, options) {
			return new google.maps.Map(element, options);
		},
		createMarker: function(options, sentiment) {
			var marker = new google.maps.Marker(options);
			var sent = sentiment;
			if (sent < 0) {
				sent = 0;
			}
			if (sent > 4) {
				sent = 4;
			}
			marker.setIcon('/images/map_marker_colors/' + colorsCnst[sent] + '.png');
			return marker;
		},
		createInfoWindow: function() {
			return new google.maps.InfoWindow();
		}
	};
}]);
/* --GoogleMaps-- */


/* RatingFactory */
SmartApp.factory('RatingFactory', ['colorsCnst', function(colorsCnst) {
	return {
		getRatingsAndClass: function(rating_full) {
			var rating = rating_full.toFixed(1);
			if (rating > 5) {
				rating = '5.0';
			}
			if (rating < 0) {
				rating = '0.0';
			}
			var tmp_rating = Math.floor(rating);
			var rating2 = (Math.floor(rating * 2) / 2).toFixed(1);
			var star_class = 'star_';
			if (tmp_rating >= 5) {
				tmp_rating = 4;
			}
			star_class += colorsCnst[tmp_rating];
			return { rating1: rating, rating2: rating2, star_class: star_class };
		}
	};
}]);
/* --RatingFactory-- */
