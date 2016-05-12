SmartApp.factory('GoogleMapsFactory', ['colorsCnst', function(colorsCnst) {
	return {
		createMap: function(element, options) {
			return new google.maps.Map(element, options);
		},
		createMarker: function(options, rating) {
			var marker = new google.maps.Marker(options),
				url = '/images/map_markers/',
				r = Math.floor(rating);
			if (r < 0) {
				r = 0;
			}
			if (r > 4) {
				r = 4;
			}
			marker.setIcon({
				url: url + colorsCnst[r] + '.png',
				scaledSize: new google.maps.Size(23, 23),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(9, 11)
			});
			marker.rating = rating;
			return marker;
		},
		createInfoWindow: function() {
			return new google.maps.InfoWindow();
		},
		resize: function(map) {
			google.maps.event.trigger(map, "resize");
		}
	};
}]);