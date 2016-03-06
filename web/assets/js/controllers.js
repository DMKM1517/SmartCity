var ctrl = angular.module('SmartControllers', []);

ctrl.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
	console.log('MainCtrl');
	var initial_zoom = 12;
	var points = [];
	map = new google.maps.Map(document.getElementById('map'), {
		// center: { lat: 45.737646, lng: 4.8965753 },
		center: { lat: 45.7591739, lng: 4.8846752 },
		zoom: initial_zoom
	});
	setMarkers(initial_zoom);
	map.addListener('zoom_changed', function() {
		setMarkers(map.getZoom());
	});
	// map.addListener('bounds_changed',function() {
	// 	console.log(map.getBounds());
	// });

	function setMarkers(zoom) {
		var marker, point;
		$http.get('/points/getPoints?zoom=' + zoom)
			.success(function(data) {
				if (data) {
					console.log(data.length);
					for (var i in data) {
						point = data[i];
						point_id = points.map(function(e) { 
							return e.id; 
						}).indexOf(point.id);
						if (point_id == -1) {
							points.push(point);
							marker = new google.maps.Marker({
								position: {
									lat: parseFloat(point.latitude),
									lng: parseFloat(point.longitude)
								},
								title: point.name
							});
							marker.setMap(map);
						}
					}
					console.log(points.length);
				}
			}).error(function(error) {
				console.log(error);
			});
	}
}]);
