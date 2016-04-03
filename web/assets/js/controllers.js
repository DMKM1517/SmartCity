/* MainCtrl */
SmartApp.controller('MainCtrl', ['$scope', '$rootScope', '$location', 'GoogleMaps', 'PointsService', 'colorsCnst', 'RatingFactory', function($scope, $rootScope, $location, GoogleMaps, PointsService, colorsCnst, RatingFactory) {

	/* Variables */

	var initial_zoom = 12;
	var limit = 100;
	var loading = true;
	var latlong = { lat: 45.7591739, lng: 4.8846752 };
	var current_zoom = initial_zoom;
	$scope.markers = [];
	$scope.markers_clusters = null;
	// initialize google maps
	$scope.map = GoogleMaps.createMap(document.getElementById('map'), {
		center: latlong,
		zoom: initial_zoom
	});
	$scope.infoWindow = GoogleMaps.createInfoWindow();
	$scope.categories = [];

	// listeners
	$scope.map.addListener('zoom_changed', function() {
		$scope.getPoints($scope.map.getZoom());
	});
	$scope.infoWindow.addListener('domready', function() {
		$('.rating').rating();
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
		PointsService.getPoints(page, limit).then(function(data) {
			for (var i in data) {
				createMarker(data[i]);
			}
			$scope.filter();
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
		});
	};

	// toggle menu
	$scope.toggleMenu = function() {
		$('#menu').fadeToggle();
		$('#toggle').toggleClass('on');
	};

	// remove all markers and place only the filtered ones
	$scope.filter = function() {
		// $scope.setMapOn($scope.markers, null);
		var filtered_ids = PointsService.filterCategories($rootScope.selected_categories);
		var filtered_markers = [];
		for (var id in $scope.markers) {
			for (var i in filtered_ids) {
				if (id == filtered_ids[i]) {
					filtered_markers.push($scope.markers[id]);
				}
			}
		}
		if ($scope.markers_clusters) {
			$scope.markers_clusters.clearMarkers();
		}
		$scope.markers_clusters = new MarkerClusterer($scope.map, filtered_markers, {
			gridSize: 40,
			minimumClusterSize: 3,
			maxZoom: 16,
			zoomOnClick: false
		});
		// $scope.setMapOn(filtered_markers, $scope.map);
	};

	// set map on markers
	$scope.setMapOn = function(markers_map, new_map) {
		for (var i in markers_map) {
			markers_map[i].setMap(new_map);
		}
	};

	// set all values of selected categories
	$scope.selectAll = function(value) {
		for (var i in $rootScope.selected_categories) {
			$rootScope.selected_categories[i] = value;
		}
		$scope.filter();
	};

	/* --Functions-- */


	/* Initialization */

	// selected categories
	if (!$rootScope.selected_categories) {
		$rootScope.selected_categories = {};
	}
	// get categories
	PointsService.getCategories().then(function(categories) {
		$scope.categories = categories;
		// initially all categories are selected
		for (var i in $scope.categories) {
			if (typeof($rootScope.selected_categories[$scope.categories[i].category]) === 'undefined') {
				$rootScope.selected_categories[$scope.categories[i].category] = true;
			}
		}
	});
	// get initial points
	$scope.getPoints(initial_zoom);

	// watch for changes in location search
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
			$scope.markers[point.id].addListener('click', function() {
				$scope.openInfoWindow(point.id);
			});
		}
	}

	function openPreviousInfoWindow(point_id, zoom) {
		loading = true;
		PointsService.getPoint(point_id).then(function(data) {
			createMarker(data);
			$scope.map.setZoom(zoom);
			$scope.filter();
			$scope.map.panTo($scope.markers[point_id].getPosition());
			$scope.openInfoWindow(point_id);
			loading = false;
		}, function(resp) {
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
