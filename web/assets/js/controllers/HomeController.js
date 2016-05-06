SmartApp.controller('HomeController', ['$scope', '$rootScope', '$location', '$compile', '$templateRequest', '$timeout', '$translate', 'GoogleMapsFactory', 'PointsService', 'colorsCnst', 'RatingFactory', 'paramsCnst', function($scope, $rootScope, $location, $compile, $templateRequest, $timeout, $translate, GoogleMapsFactory, PointsService, colorsCnst, RatingFactory, paramsCnst) {

	/* Variables */

	var loading = true,
		latlong_lyon = {
			lat: 45.7591739,
			lng: 4.8846752
		}, // initial lat long
		opt_markers_clusters = {
			gridSize: 43,
			minimumClusterSize: 2,
			maxZoom: 16,
			zoomOnClick: false,
			styles: [{
				url: '/images/map_markers/multiple_small.png',
				height: 47,
				width: 47,
				textColor: '#ddffff'
			}, {
				url: '/images/map_markers/multiple_medium.png',
				height: 52,
				width: 52,
				textColor: '#ddffff'
			}, {
				url: '/images/map_markers/multiple_large.png',
				height: 57,
				width: 57,
				textColor: '#ddffff'
			}]
		}; // options for marker clusterer
	$scope.showFilter = true; // show the menu
	$scope.languages = paramsCnst.languages; // available languages
	$scope.current_language = $translate.use(); // current language
	$scope.markers = []; // array of markers
	// $scope.group_markers = [];
	$scope.markers_clusters = null; // object of marker clusterer
	$scope.infoWindow = GoogleMapsFactory.createInfoWindow(); // infowindow for points
	$scope.infoWindow2 = GoogleMapsFactory.createInfoWindow(); // infowindow for clusters
	$scope.categories = []; // array of categories

	/* --Variables-- */


	/* Functions */

	// get the points and create the markers
	$scope.getPoints = function(zoom) {
		loading = true;
		var page = zoom - paramsCnst.initial_zoom;
		if (page < 0) {
			page = 0;
		}
		PointsService.getPoints(page, paramsCnst.limit_points).then(function(data) {
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

	// open a infowindow
	$scope.openInfoWindow = function(point_id, options) {
		$scope.point = {};
		$scope.cluster = {};
		$scope.infoWindow2.close();
		if (point_id) {
			PointsService.getPoint(point_id).then(function(point) {
				var RF = RatingFactory.getRatingsAndClass(point.rating);
				$translate(['address', 'web', 'schedule', 'more_information', 'translate_google', point.category]).then(function(translations) {
					point.translations = translations;
					point.RF = RF;
					point.zoom = $scope.map.getZoom();
					if (point.address && $scope.current_language != paramsCnst.original_language) {
						point.url_translate_address = 'https://translate.google.com/#' + paramsCnst.original_language + '/' + $scope.current_language + '/' + encodeURI(point.address);
					}
					if (point.schedule && $scope.current_language != paramsCnst.original_language) {
						point.url_translate_schedule = 'https://translate.google.com/#' + paramsCnst.original_language + '/' + $scope.current_language + '/' + encodeURI(point.schedule);
					}
					if (point.web) {
						point.web_links = point.web.split(';');
					}
					$scope.point = point;
					$templateRequest('/templates/infowindow.html').then(function(template) {
						var content = $compile(template)($scope);
						$timeout(function() {
							$scope.infoWindow.setContent(content.html());
							$scope.infoWindow.open($scope.map, $scope.markers[point_id]);
						});
					});
				});
			});
		} else {
			$translate(['points_here', 'avg_rating']).then(function(translations) {
				var content = '<div>' + options.count + ' ' + translations.points_here + '. ' + translations.avg_rating + ': ' + options.rating + '</div>';
				$scope.infoWindow2.setContent(content);
				$scope.infoWindow2.setPosition(options.center);
				$scope.infoWindow2.open($scope.map);
			});
		}
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
		// if ($scope.markers_clusters && $scope.markers_clusters.getTotalClusters() > 0) {
		// 	$scope.markers_clusters.clearMarkers();
		// }
		$scope.markers_clusters.addMarkers(filtered_markers);
		// $scope.setMapOn(filtered_markers, $scope.map);
	};

	// set map on markers
	$scope.setMapOn = function(markers_to_map, new_map) {
		for (var i in markers_to_map) {
			markers_to_map[i].setMap(new_map);
		}
	};

	// set all values of selected categories
	$scope.selectAll = function(value) {
		for (var i in $rootScope.selected_categories) {
			$rootScope.selected_categories[i] = value;
		}
		$scope.filter();
	};

	// change language
	$scope.changeLanguage = function(lang) {
		$scope.infoWindow.close();
		$translate.use(lang).then(function() {
			$scope.current_language = lang;
		});
	};

	/* --Functions-- */


	/* Initialization */

	// preferred language
	if (!$translate.use()) {
		$translate.use($translate.preferredLanguage());
		$scope.current_language = $translate.preferredLanguage();
	}

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

	/*PointsService.getCommunes().then(function(communes) {
		for (var i in communes) {
			createGroupMarker(communes[i]);
		}
	});*/

	// watch for changes in location search
	$scope.$watch($location.search(), function() {
		var param_id = $location.search().id;
		var param_zoom = $location.search().z;
		if (!param_zoom) {
			param_zoom = paramsCnst.initial_zoom;
		} else {
			param_zoom = parseInt(param_zoom);
		}
		if (typeof param_id !== 'undefined') {
			openPreviousInfoWindow(param_id, param_zoom);
		}
	}, true);

	// wait for dom ready
	$timeout(function() {
		// open menu if the window is big enough
		if ($(document).width() > 700) {
			$scope.toggleMenu();
		}
		// initialize twitter widget
		if ($(document).height() > 650) {
			twttr.widgets.load(document.getElementById("twitter"));
		} else {
			$('#twitter').hide();
		}
		// initialize google map
		$scope.map = GoogleMapsFactory.createMap(document.getElementById('map'), {
			center: latlong_lyon,
			zoom: paramsCnst.initial_zoom
		});
		// initialize markers clusterer
		$scope.markers_clusters = new MarkerClusterer($scope.map, null, opt_markers_clusters);
		// set calculator for cluster icon
		$scope.markers_clusters.setCalculator(function(markers, numStyles) {
			var index = 0;
			var count = markers.length;
			var dv = count;
			var avg_rating = markers.map(function(el) {
				return el.rating;
			}).reduce(function(x, y) {
				return x + y;
			}) / count;
			while (dv !== 0) {
				dv = parseInt(dv / 10, 10);
				index++;
			}

			index = Math.min(index, numStyles);
			return {
				text: count,
				index: index
			};
		});
		// listeners
		$scope.map.addListener('zoom_changed', function() {
			$scope.getPoints($scope.map.getZoom());
		});
		$scope.infoWindow.addListener('domready', function() {
			$('.rating').rating();
		});
		$scope.markers_clusters.addListener('mouseover', function(cluster) {
			var markers = cluster.getMarkers();
			var count = markers.length;
			var avg_rating = markers.map(function(el) {
				return el.rating;
			}).reduce(function(x, y) {
				return x + y;
			}) / count;
			var options = {
				center: cluster.getCenter(),
				rating: avg_rating.toFixed(1),
				count: count,
			};
			$scope.openInfoWindow(null, options);
		});
		$scope.markers_clusters.addListener('mouseout', function(cluster) {
			$scope.infoWindow2.close();
		});
		$scope.markers_clusters.addListener('click', function(cluster) {
			$scope.infoWindow2.close();
			$scope.map.fitBounds(cluster.getBounds());
			$scope.map.setZoom($scope.map.getZoom() - 1);
		});

		// get initial points
		$scope.getPoints(paramsCnst.initial_zoom);
	}, 100);

	/* --Initialization-- */


	/* Aux Functions */

	function createMarker(point) {
		if (!$scope.markers[point.id]) {
			var marker = GoogleMapsFactory.createMarker({
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

	function createGroupMarker(group) {
		if (!$scope.group_markers[group.name]) {
			var marker = GoogleMapsFactory.createMarker({
				position: {
					lat: parseFloat(group.latitude),
					lng: parseFloat(group.longitude)
				},
				title: group.name
			}, 0, true);
			$scope.group_markers[group.name] = marker;
			// $scope.markers[point.id].addListener('click', function() {
			// 	$scope.openInfoWindow(point.id);
			// });
		}
	}

	function openPreviousInfoWindow(point_id, zoom) {
		loading = true;
		if (!$scope.map) {
			setTimeout(function() {
				openPreviousInfoWindow(point_id, zoom);
			}, 500);
		} else {
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
	}

	function getBoundsZoomLevel(bounds, mapDim) {
		var WORLD_DIM = { height: 256, width: 256 };
		var ZOOM_MAX = 21;

		function latRad(lat) {
			var sin = Math.sin(lat * Math.PI / 180);
			var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
			return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
		}

		function zoom(mapPx, worldPx, fraction) {
			return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
		}

		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();

		var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

		var lngDiff = ne.lng() - sw.lng();
		var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

		var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
		var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

		return Math.min(latZoom, lngZoom, ZOOM_MAX);
	}

	/* --Aux Functions-- */

}]);
