SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var points = {};
	var pages_loaded = [];

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

	this.getPoint = function(id) {
		var defer = $q.defer();
		if (!points[id]) {
			$http.get('/points/' + id).success(function(resp) {
				defer.resolve(resp);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points[id]);
		}
		return defer.promise;
	};
}]);

SmartApp.factory('GoogleMaps', function() {
	return {
		createMap: function(element, options) {
			return new google.maps.Map(element, options);
		},
		createMarker: function(options, sentiment) {
			var marker = new google.maps.Marker(options);
			var colors = ['red', 'orange', 'yellow', 'lgreen', 'green'];
			var sent = sentiment;
			if (sent < 0) {
				sent = 0;
			}
			if (sent > 4) {
				sent = 4;
			}
			marker.setIcon('/images/map_marker_colors/' + colors[sent] + '.png');
			return marker;
		},
		createInfoWindow: function() {
			return new google.maps.InfoWindow();
		}
	};
});
