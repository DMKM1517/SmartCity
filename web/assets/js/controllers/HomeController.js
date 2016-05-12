SmartApp.controller('HomeController', ['$scope', '$rootScope', '$location', '$compile', '$templateRequest', '$timeout', '$translate', 'GoogleMapsFactory', 'PointsService', 'RatingFactory', 'colorsCnst', 'colorsTextCnst', 'paramsCnst', function($scope, $rootScope, $location, $compile, $templateRequest, $timeout, $translate, GoogleMapsFactory, PointsService, RatingFactory, colorsCnst, colorsTextCnst, paramsCnst) {

	/* Variables */

	var loading = true,
		twitter_loaded = false, // if twitter widget is already loaded
		min_width_menu = 700, // min width to open the menu at initialization
		min_width_twitter = 800, // min width to open twitter
		min_width_both = 1080, // min width to open twitter and menu at the same time
		latlong_lyon = { // initial lat long
			lat: 45.7591739,
			lng: 4.8846752
		},
		opt_markers_clusters = { // options for marker clusterer
			gridSize: 43,
			minimumClusterSize: 2,
			maxZoom: 16,
			zoomOnClick: false,
			styles: []
		};
	$scope.show_filter = true; // show the menu
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
		$rootScope.menu_opened = !$rootScope.menu_opened;
		$('#toggle').toggleClass('on');
		$('#menu').fadeToggle(320, function() {
			resizeMap();
		});
		var offset_width_menu = $('#menu').outerWidth(true),
			sign = $rootScope.menu_opened ? '+=' : '-=';
		$('#menu_twitter').animate({ right: sign + offset_width_menu + 'px' }, 350);
		$('#cont_twitter').animate({ right: sign + offset_width_menu + 'px' }, 350);
		if ($rootScope.menu_opened && window.innerWidth < min_width_both && $rootScope.twitter_opened) {
			$scope.toggleTwitter();
		}
	};

	// toggle twitter
	$scope.toggleTwitter = function() {
		$rootScope.twitter_opened = !$rootScope.twitter_opened;
		$('#cont_twitter').show();
		$('.btn_hide').toggleClass('fa-angle-double-up');
		$('.btn_hide').toggleClass('fa-angle-double-down');
		$('#twitter').slideToggle('fast', function() {
			resizeMap();
		});
		if ($rootScope.twitter_opened && window.innerWidth < min_width_both && $rootScope.menu_opened) {
			$scope.toggleMenu();
		}
	};

	// remove all markers and place only the filtered ones
	$scope.filter = function() {
		var filtered_ids = PointsService.filterCategories($rootScope.selected_categories, $rootScope.show.only_top);
		var filtered_markers = [];
		for (var id in $scope.markers) {
			for (var i in filtered_ids) {
				if (id == filtered_ids[i]) {
					filtered_markers.push($scope.markers[id]);
				}
			}
		}
		$scope.markers_clusters.clearMarkers();
		$scope.markers_clusters.addMarkers(filtered_markers);
	};

	// set map on markers
	/*$scope.setMapOn = function(markers_to_map, new_map) {
		for (var i in markers_to_map) {
			markers_to_map[i].setMap(new_map);
		}
	};*/

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

	// if not set, show all
	if (typeof $rootScope.show === 'undefined') {
		$rootScope.show = { only_top: false };
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

	// setup the styles for markers clusterer
	for (var i in colorsCnst) {
		opt_markers_clusters.styles.push({
			url: '/images/map_markers/m_small_' + colorsCnst[i] + '.png',
			height: 49,
			width: 48,
			textColor: colorsTextCnst[i]
		});
		opt_markers_clusters.styles.push({
			url: '/images/map_markers/m_medium_' + colorsCnst[i] + '.png',
			height: 54,
			width: 53,
			textColor: colorsTextCnst[i]
		});
		opt_markers_clusters.styles.push({
			url: '/images/map_markers/m_large_' + colorsCnst[i] + '.png',
			height: 66,
			width: 65,
			textColor: colorsTextCnst[i]
		});
	}

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

	// on resize show/hide twitter widget
	$(window).resize(function() {
		showTwitter();
	});

	// wait for dom ready
	$timeout(function() {
		// initialize google map
		$scope.map = GoogleMapsFactory.createMap(document.getElementById('map'), {
			center: latlong_lyon,
			zoom: paramsCnst.initial_zoom
		});
		// initialize markers clusterer
		$scope.markers_clusters = new MarkerClusterer($scope.map, null, opt_markers_clusters);
		// set calculator for cluster icon
		$scope.markers_clusters.setCalculator(function(markers, numStyles) {
			var size = 0;
			var count = markers.length;
			var dv = count;
			var avg_rating = markers.map(function(el) {
				return el.rating;
			}).reduce(function(x, y) {
				return x + y;
			}) / count;
			while (dv !== 0) {
				dv = parseInt(dv / 10, 10);
				size++;
			}
			var tmp_rating = Math.min(Math.max(Math.floor(avg_rating), 0), 4);
			size = Math.min(size, numStyles / colorsCnst.length);
			return {
				text: count,
				index: tmp_rating * 3 + size
			};
		});

		// listeners
		$scope.map.addListener('zoom_changed', function() {
			$scope.getPoints($scope.map.getZoom());
		});
		$scope.map.addListener('click', function() {
			$scope.infoWindow.close();
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

		// show twitter widget
		showTwitter();

		// open menu if the window is big enough
		if (typeof $rootScope.menu_opened === 'undefined') {
			if (window.innerWidth > min_width_menu) {
				$rootScope.menu_opened = true;
			} else {
				$rootScope.menu_opened = false;
			}
		}
		if ($rootScope.menu_opened) {
			$rootScope.menu_opened = false; // it will be toggled to true
			$scope.toggleMenu();
		}

		// get initial points
		$scope.getPoints(paramsCnst.initial_zoom);

	}, 250);

	/* --Initialization-- */


	/* Aux Functions */

	// create a marker with the data of point, add it to the markers array
	//and add listener to open the info window
	function createMarker(point) {
		if (!$scope.markers[point.id]) {
			var marker = GoogleMapsFactory.createMarker({
				position: {
					lat: parseFloat(point.latitude),
					lng: parseFloat(point.longitude)
				},
				title: point.name
			}, point.rating);
			$scope.markers[point.id] = marker;
			$scope.markers[point.id].addListener('click', function() {
				$scope.openInfoWindow(point.id);
			});
		}
	}

	// open the info window of the point and pan to it
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

	// resize the map when the menu or twitter widget are opened or closed
	function resizeMap() {
		var offset_width_twitter = $('#cont_twitter').outerWidth(true),
			offset_width_menu = $('#menu').outerWidth(true);
		if (!$rootScope.twitter_opened || !$('#cont_twitter').is(':visible')) {
			offset_width_twitter = 0;
		}
		if (!$rootScope.menu_opened) {
			offset_width_menu = 0;
		}
		$('#cont_map').width((window.innerWidth - offset_width_twitter - offset_width_menu));
		GoogleMapsFactory.resize($scope.map);
	}

	// show/hide twitter widget
	function showTwitter() {
		if (window.innerWidth > min_width_twitter) {
			if (!twitter_loaded) {
				try {
					twttr.widgets.load(document.getElementById("twitter"));
					twitter_loaded = true;
					if (typeof $rootScope.twitter_opened === 'undefined') {
						$rootScope.twitter_opened = true;
					}
				} catch (e) {
					console.log(e);
					$rootScope.twitter_opened = false;
				}
			}
			if (twitter_loaded) {
				$('#menu_twitter').show();
				if ($rootScope.twitter_opened) {
					$('#cont_twitter').show();
				}
			}
		} else {
			$('#cont_twitter').hide();
			$('#menu_twitter').hide();
		}
		resizeMap();
	}

	/* --Aux Functions-- */

}]);
