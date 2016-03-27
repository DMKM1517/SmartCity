SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	return {
		'getPoints': function(page) {
			var defer = $q.defer();
			$http.get('/points/getPoints?page=' + (page + 1)).success(function(resp) {
				defer.resolve(resp);
			}).error(function(err) {
				defer.reject(err);
			});
			return defer.promise;
		}
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
