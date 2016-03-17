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
	$scope.infoWindow = GoogleMaps.createInfoWindow();

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
						if (!$scope.points[point.id]) {
							$scope.points[point.id] = point;
							marker = GoogleMaps.createMarker({
								position: {
									lat: parseFloat(point.latitude),
									lng: parseFloat(point.longitude)
								},
								title: point.name
							}, point.sentiment);
							$scope.markers[page][point.id] = marker;
							$scope.markers[page][point.id].setMap($scope.map);
							addListenerMarker(page, point.id);
						}
					}
					pages_loaded.push(page);
				}
			}, function(response) {
				console.log(response);
			});
		}

	};

	$scope.openInfoWindow = function(page, point_id) {
		var point = $scope.points[point_id];
		var content = '<div style="max-width:400px">' +
			'<h4>' + point.name + '</h4>';
		if (point.email) {
			content += '<b>Email:</b> <a href="mailto:' + point.email + '">' + point.email + '</a><br>';
		}
		if (point.address) {
			content += '<b>Address:</b> ' + point.address + '<br>';
		}
		if (point.web) {
			content += '<b>Web:</b> <a href="' + point.web + '" target="_blank">' + point.web + '</a><br>';
		}
		if (point.facebook) {
			content += '<b>Facebook:</b> ' + point.facebook + '<br>';
		}
		if (point.phone) {
			content += '<b>Phone:</b> ' + point.phone + '<br>';
		}
		if (point.schedule) {
			content += '<b>Schedule:</b> ' + point.schedule;
		}
		if (content.endsWith('<br>')) {
			content = content.slice(0, -4);
		}
		content += '</div>';
		$scope.infoWindow.setContent(content);
		$scope.infoWindow.open($scope.map, $scope.markers[page][point_id]);
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

	function addListenerMarker(page, point_id) {
		$scope.markers[page][point_id].addListener('click', function() {
			$scope.openInfoWindow(page, point_id);
		});
	}
}]);
