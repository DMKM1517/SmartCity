/* MainCtrl */
SmartApp.controller('MainCtrl', ['$scope', '$location', 'GoogleMaps', 'PointsService', 'colorsCnst', 'RatingFactory', function($scope, $location, GoogleMaps, PointsService, colorsCnst, RatingFactory) {

	/* Variables */

	var initial_zoom = 12;
	var limit = 50;
	var loading = true;
	var latlong = { lat: 45.7591739, lng: 4.8846752 };
	var current_zoom = initial_zoom;
	$scope.markers = [];
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

	/* --Variables-- */


	/* Functions */

	// get the points and create the markers
	$scope.getPoints = function(zoom) {
		loading = true;
		var page = zoom - initial_zoom;
		if (page < 0) {
			page = 0;
		}
		//setMarkers(page);
		PointsService.getPoints(page, limit).then(function(data) {
			for (var i in data) {
				createMarker(data[i]);
			}
			loading = false;
		}, function(response) {
			console.log(response);
			loading = false;
		});
	};

	// open the info window
	$scope.openInfoWindow = function(point_id) {
		PointsService.getPoint(point_id).then(function(point) {
			var RF = RatingFactory.getRatingsAndClass(point.rating);
			var content = '<div class="info_window">' +
				'<div class="row">' +
				'<div class="col-xs-9">' +
				'<h4>' + point.name + '</h4>' +
				'<div class="category">' + point.category + '</div>' +
				'</div>' +
				'<div class="col-xs-3">' +
				'<div class="stars ' + RF.star_class + '">' +
				'<input type="hidden" class="rating" data-fractions="2" value="' + RF.rating2 + '" data-readonly/>' +
				'</div>' +
				RF.rating1 +
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
		});
	};

	/* --Functions-- */


	/* Initialization */

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


	/* --Initialization-- */


	/* Aux Functions */

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

	function createMarker(point) {
		if (!$scope.markers[point.id]) {
			var marker = GoogleMaps.createMarker({
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

	function addListenerMarker(point_id) {
		$scope.markers[point_id].addListener('click', function() {
			$scope.openInfoWindow(point_id);
		});
	}

	function openPreviousInfoWindow(point_id, zoom) {
		loading = true;
		PointsService.getPoint(point_id).then(function(data) {
			createMarker(data);
			$scope.map.setZoom(zoom);
			$scope.openInfoWindow(point_id);
			loading = false;
		}, function(resp) {
			console.log('Point ' + point_id + ' not found');
			$location.search({});
			loading = false;
		});
	}

	/* --Aux Functions-- */

}]);
/* --MainCtrl-- */


/* PointCtrl */
SmartApp.controller('PointCtrl', ['$scope', '$routeParams', '$location', 'PointsService', 'RatingFactory', function($scope, $routeParams, $location, PointsService, RatingFactory) {

	/* Variables */

	var initial_zoom = 12;
	var id = $routeParams.id;
	var searchParam = $location.search();
	var param_zoom = searchParam.z;

	/* --Variables-- */


	/* Initialization */

	if (!param_zoom) {
		param_zoom = initial_zoom;
	}

	// get the information of the point
	PointsService.getPoint(id).then(function(data) {
		$scope.point = data;
		$scope.RF = RatingFactory.getRatingsAndClass($scope.point.rating);
		setTimeout(function() {
			$('.rating').rating();
		}, 100);
	}, function() {
		$scope.point = { name: 'Point not found' };
	});

	/* --Initialization-- */


	/* Functions */

	$scope.back = function() {
		$location.path('/').search({ id: id, z: param_zoom });
	};

	/* --Functions-- */

}]);
/* --PointCtrl-- */
