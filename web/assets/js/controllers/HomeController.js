SmartApp.controller('HomeController', ['$scope', '$rootScope', '$location', '$compile', '$templateRequest', '$timeout', '$translate', 'GoogleMapsFactory', 'PointsService', 'RatingFactory', 'colorsCnst', 'paramsCnst', function($scope, $rootScope, $location, $compile, $templateRequest, $timeout, $translate, GoogleMapsFactory, PointsService, RatingFactory, colorsCnst, paramsCnst) {

	/* Variables */

	var loading = true,
		map_ready = false,
		twitter_loaded = false, // if twitter widget is already loaded
		min_width_menu = 700, // min width to open the menu at initialization
		min_width_twitter = 800, // min width to open twitter
		min_width_both = 1080; // min width to open twitter and menu at the same time
	$scope.show_filter = true; // show the menu
	$scope.languages = paramsCnst.languages; // available languages
	$scope.current_language = $translate.use(); // current language
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
			map_ready = true;
			loading = false;
		}, function(response) {
			loading = false;
		});
	};

	// open a infowindow
	$scope.openMarkerInfowindow = function(point_id) {
		$scope.point = {};
		GoogleMapsFactory.closeInfowindow('cluster');
		PointsService.getPoint(point_id).then(function(point) {
			createMarker(point);
			$scope.filter();
			var RF = RatingFactory.getRatingsAndClass(point.rating);
			$translate(['address', 'web', 'schedule', 'more_information', 'translate_google', point.category]).then(function(translations) {
				point.translations = translations;
				point.RF = RF;
				point.zoom = GoogleMapsFactory.getZoom();
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
						GoogleMapsFactory.openInfowindow('marker', content.html(), parseInt(point_id));
					});
				});
			});
			selectResultAnimation(point.id);
		});
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
		var filtered_ids = [];
		if ($rootScope.results && $rootScope.results.length > 0) {
			filtered_ids = $rootScope.results.map(function(el) {
				return el.id;
			});
		} else {
			filtered_ids = PointsService.filterCategories($rootScope.selected_categories, $rootScope.show.only_top);
		}
		GoogleMapsFactory.filterMarkers(filtered_ids);
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

	// search while typing in local stored points
	$scope.typeaheadSearch = function(query) {
		return PointsService.search(query, true).then(function(results) {
			return results;
		});
	};

	// select a result from typeahead results
	$scope.typeaheadSelectResult = function(item, model, label, event) {
		$scope.search_query = model.name;
		$('#search_input').blur();
		$scope.search($scope.search_query);
	};

	// if pressed enter, search
	$scope.typing = function(event) {
		if (event.which === 13) {
			$('#search_input').blur();
			$scope.search($scope.search_query);
		}
	};

	// search from server
	$scope.search = function(query) {
		$scope.no_results = false;
		$rootScope.results = [];
		if (query.length > 0) {
			$translate(['searching', 'results_for']).then(function(translations) {
				$rootScope.searching = translations.searching;
				PointsService.search(query, false).then(function(resp) {
					GoogleMapsFactory.closeInfowindow('marker');
					var results = resp.results;
					for (var i in resp.new_points) {
						createMarker(resp.new_points[i]);
					}
					if (query.length > 15) {
						query = query.substr(0, 15) + '...';
					}
					$rootScope.searching = results.length + ' ' + translations.results_for + ': "' + query + '"';
					$rootScope.results = results;
					$scope.filter();
					GoogleMapsFactory.fitMapToMarkers();
				});
			});
		}
	};

	$scope.selectResult = function(point_id) {
		GoogleMapsFactory.setZoom(paramsCnst.initial_zoom);
		$scope.openMarkerInfowindow(point_id);
	};

	$scope.removeSearch = function() {
		$scope.no_results = false;
		$scope.search_query = '';
		$rootScope.searching = '';
		$rootScope.results = [];
		$scope.filter();
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

	// watch for changes in location search
	$scope.$watch($location.search(), function() {
		var param_id = $location.search().id;
		if (typeof param_id !== 'undefined') {
			openPreviousInfoWindow(param_id);
		}
	}, true);

	// on resize show/hide twitter widget
	$(window).resize(function() {
		showTwitter();
	});

	// wait for dom ready
	$timeout(function() {
		// initialize map
		GoogleMapsFactory.initializeMap(document.getElementById('map'));

		// listeners
		GoogleMapsFactory.addListener('map', 'zoom_changed', function() {
			GoogleMapsFactory.closeInfowindow('cluster');
			// $scope.getPoints(GoogleMapsFactory.getZoom());
		});
		GoogleMapsFactory.addListener('map', 'click', function() {
			GoogleMapsFactory.closeInfowindow('marker');
			$('.result').removeClass('result_selected');
		});
		GoogleMapsFactory.addListener('infowindow_marker', 'domready', function() {
			$('.rating').rating();
		});
		GoogleMapsFactory.addListener('markers_clusters', 'mouseover', function(cluster) {
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
			$translate(['points_here', 'avg_rating'], { num: options.count }).then(function(translations) {
				var content = '<div>' + translations.points_here + '. ' + translations.avg_rating + ': ' + options.rating + '</div>';
				GoogleMapsFactory.openInfowindow('cluster', content, options.center);
			});
		});
		GoogleMapsFactory.addListener('markers_clusters', 'mouseout', function(cluster) {
			GoogleMapsFactory.closeInfowindow('cluster');
		});
		GoogleMapsFactory.addListener('markers_clusters', 'click', function(cluster) {
			GoogleMapsFactory.closeInfowindow('cluster');
			GoogleMapsFactory.fitBounds(cluster.getBounds());
			GoogleMapsFactory.setZoom('-1');
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

	}, 300);

	/* --Initialization-- */


	/* Aux Functions */

	// create a marker with the data of point
	function createMarker(point) {
		GoogleMapsFactory.createMarker({
			position: {
				lat: parseFloat(point.latitude),
				lng: parseFloat(point.longitude)
			},
			title: point.name
		}, point.id, point.rating, function() {
			$scope.openMarkerInfowindow(point.id);
		});
	}

	// open the info window of the point and pan to it
	function openPreviousInfoWindow(point_id) {
		loading = true;
		if (!map_ready) {
			setTimeout(function() {
				openPreviousInfoWindow(point_id);
			}, 500);
		} else {
			$scope.openMarkerInfowindow(point_id);
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
		GoogleMapsFactory.resize();
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

	function selectResultAnimation(point_id) {
		var result = $('#r' + point_id),
			container = $('#results_table');
		$('.result').removeClass('result_selected');
		if (result.offset()) {
			result.addClass('result_selected');
			container.animate({
				scrollTop: result.offset().top - container.offset().top + container.scrollTop() - result.height()
			});
		}
	}

	/* --Aux Functions-- */

}]);
