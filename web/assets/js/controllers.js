SmartApp.controller('MainCtrl', ['$scope', '$location', 'GoogleMaps', 'PointsService', function($scope, $location, GoogleMaps, PointsService) {

	/* -- Variables -- */

	var initial_zoom = 12;
	var limit = 50;
	var loading = true;
	var latlong = { lat: 45.7591739, lng: 4.8846752 };
	var time_elapsed = 0;
	var max_time_elapsed = 10;
	var current_zoom = initial_zoom;
	$scope.markers = [];
	$scope.points = {};
	// initialize google maps
	$scope.map = GoogleMaps.createMap(document.getElementById('map'), {
		center: latlong,
		zoom: initial_zoom
	});
	$scope.infoWindow = GoogleMaps.createInfoWindow();

	// listeners
	$scope.map.addListener('zoom_changed', function() {
		$scope.getPoints($scope.map.getZoom());
	});

	/* -- -- */


	/* -- Functions -- */

	// get the points and create the markers
	$scope.getPoints = function(zoom) {
		loading = true;
		var marker, point;
		var page = zoom - initial_zoom;
		if (page < 0) {
			page = 0;
		}
		//setMarkers(page);
		PointsService.getPoints(page, limit).then(function(data) {
			$scope.points = data;
			for (var i in data) {
				point = data[i];
				if (!$scope.markers[point.id]) {
					marker = GoogleMaps.createMarker({
						position: {
							lat: parseFloat(point.latitude),
							lng: parseFloat(point.longitude)
						},
						title: point.name
					}, Math.floor(point.rating));
					$scope.markers[point.id] = marker;
					$scope.markers[point.id].setMap($scope.map);
					addListenerMarker(point.id);
				}
			}
			loading = false;
		}, function(response) {
			console.log(response);
		});
	};

	// open the info window
	$scope.openInfoWindow = function(point_id) {
		var point = $scope.points[point_id];
		var rating = point.rating.toFixed(1);
		var tmp_rating = Math.floor(rating);
		var tmp_rating2 = (Math.round(point.rating * 2) / 2).toFixed(1);
		var colors = ['red', 'orange', 'yellow', 'lgreen', 'green'];
		var star_class = '';
		if (tmp_rating < 0 || tmp_rating > 5) {
			tmp_rating = 0;
		}
		if (tmp_rating !== 0) {
			star_class = 'star_' + colors[tmp_rating];
		}
		var content = '<div class="info_window">' +
			'<div class="row">' +
			'<div class="col-xs-9">' +
			'<h4>' + point.name + '</h4>' +
			'<div class="category">' + point.category + '</div>' +
			'</div>' +
			'<div class="col-xs-3">' +
			'<div class="stars ' + star_class + '">' +
			'<input type="hidden" class="rating" data-fractions="2" value="' + tmp_rating2 + '" data-readonly/>' +
			'</div>' +
			rating +
			'</div>' +
			'</div>';
		if (point.address) {
			content += '<b>Address:</b> ' + point.address + '<br>';
		}
		if (point.web) {
			var links = point.web.split(';');
			content += '<b>Web:</b> ';
			for (var i in links) {
				content += '<a href="' + links[i] + '" target="_blank">' + links[i] + '</a><br>';
			}
		}
		if (point.schedule) {
			content += '<b>Schedule:</b> ' + point.schedule;
		}
		if (content.endsWith('<br>')) {
			content = content.slice(0, -4);
		}
		content += '<div class="row">' +
			'<div class="col-xs-9">' +
			'</div>' +
			'<div class="col-xs-3">' +
			'<a href="#/point/' + point.id + '?z=' + $scope.map.getZoom() + '">More information</a>' +
			'</div>' +
			'</div>' +
			'</div>';

		$scope.infoWindow.setContent(content);
		$scope.infoWindow.open($scope.map, $scope.markers[point_id]);
		$('.rating').rating();
	};

	/* -- -- */


	/* -- Initialization -- */

	// get initial points
	$scope.getPoints(initial_zoom);

	$scope.$watch(function() {
		return $location.search();
	}, function() {
		var param_id = $location.search().id;
		var param_zoom = $location.search().z;
		current_zoom = initial_zoom + 1;
		if (!param_zoom) {
			param_zoom = initial_zoom;
		} else {
			param_zoom = parseInt(param_zoom);
		}
		if (typeof param_id !== 'undefined') {
			openPreviousInfoWindow(param_id, param_zoom);
		}
	}, true);


	/* -- -- */


	/* -- Aux Functions -- */

	/*function setMarkers(page) {
		setMapOn($scope.markers, null);
		console.log($scope.markers);
		var markers_page = $scope.markers.slice(0, (page + 1) * limit);
		console.log(markers_page);
		setMapOn(markers_page, $scope.map);
	}*/

	/*function setMapOn(markers_map, new_map) {
		for (var i in markers_map) {
			markers_map[i].setMap(new_map);
		}
	}*/

	function addListenerMarker(point_id) {
		$scope.markers[point_id].addListener('click', function() {
			$scope.openInfoWindow(point_id);
		});
	}

	function openPreviousInfoWindow(point_id, zoom) {
		if (!$scope.points[point_id]) {
			if (!loading && current_zoom <= zoom) {
				$scope.getPoints(current_zoom++);
			}
			if (time_elapsed < max_time_elapsed) {
				setTimeout(function() {
					time_elapsed++;
					openPreviousInfoWindow(point_id, zoom);
				}, 500);
			}
			else{
				console.log('no loaded the point');
				time_elapsed = 0;
			}
		} else {
			$scope.map.setZoom(zoom);
			$scope.openInfoWindow(point_id);
		}
	}

	/* -- -- */
}]);


SmartApp.controller('PointCtrl', ['$scope', '$routeParams', '$location', 'PointsService', function($scope, $routeParams, $location, PointsService) {
	var initial_zoom = 12;
	var id = $routeParams.id;
	var searchParam = $location.search();
	var param_zoom = searchParam.z;
	if (!param_zoom) {
		param_zoom = initial_zoom;
	}
	PointsService.getPoint(id).then(function(data) {
		$scope.point = data;
	});
	$scope.back = function() {
		$location.path('/').search({ id: id, z: param_zoom });
	};
}]);
