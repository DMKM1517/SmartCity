var ctrl = angular.module('SmartControllers', []);

ctrl.controller('MainCtrl', ['$scope', 'GoogleMaps', 'PointsService', function($scope, GoogleMaps, PointsService) {
	console.log('MainCtrl');
	var initial_zoom = 12;
	var pages_loaded = [];
	$scope.markers = [];
	$scope.points = [];
	$scope.map = GoogleMaps.createMap(document.getElementById('map'), {
		// center: { lat: 45.737646, lng: 4.8965753 },
		center: { lat: 45.7591739, lng: 4.8846752 },
		zoom: initial_zoom
	});
	$scope.map.addListener('zoom_changed', function() {
		$scope.getPoints($scope.map.getZoom());
	});
	// map.addListener('bounds_changed',function() {
	// 	console.log(map.getBounds());
	// });

	$scope.getPoints = function(zoom) {
		var marker, point;
		var page = zoom - initial_zoom;
		if (page < 0) {
			page = 0;
		}
		setMarkers(page);
		if (pages_loaded.indexOf(page) == -1) {
			$scope.markers[page] = [];
			PointsService.getPoints(page).then(function(data) {
				if (data) {
					for (var i in data) {
						point = data[i];
						point_id = $scope.points.map(function(e) {
							return e.id;
						}).indexOf(point.id);
						if (point_id == -1) {
							$scope.points.push(point);
							marker = GoogleMaps.createMarker({
								position: {
									lat: parseFloat(point.latitude),
									lng: parseFloat(point.longitude)
								},
								title: point.name,
								label: point.sentiment.toString()
							});
							$scope.markers[page][point.id] = marker;
							$scope.markers[page][point.id].setMap($scope.map);
						}
					}
					pages_loaded.push(page);
				}
			}, function(response) {
				console.log(response);
			});
		}

	};

	$scope.getPoints(initial_zoom);

	function setMarkers(page) {
		setMapOn($scope.markers, null);
		var markers_page = $scope.markers.slice(0, page + 1);
		setMapOn(markers_page, $scope.map);
	}

	function setMapOn(markers_map, new_map) {
		for (var page in markers_map) {
			for (var i in markers_map[page]) {
				markers_map[page][i].setMap(new_map);
			}
		}
	}
}]);
