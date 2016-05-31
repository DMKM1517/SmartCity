SmartApp.controller('HomeController', ['$scope', '$rootScope', '$location', '$compile', '$templateRequest', '$timeout', '$translate', 'GoogleMapsFactory', 'PointsService', 'RatingFactory', 'colorsCnst', 'paramsCnst', function($scope, $rootScope, $location, $compile, $templateRequest, $timeout, $translate, GoogleMapsFactory, PointsService, RatingFactory, colorsCnst, paramsCnst) {

	/* Variables */

	var loading = true,
		param_id = $location.search().id, // parameter of point id
		twitter_loaded = false, // if twitter widget is already loaded
		min_width_menu = 700, // min width to open the menu at initialization
		min_width_twitter = 800, // min width to open twitter
		min_width_both = 1080, // min width to open twitter and menu at the same time
		searching_promise;
	$scope.loading = true; // show loading animation
	$scope.show_filter = true; // show the menu
	$scope.languages = paramsCnst.languages; // available languages
	$scope.current_language = $translate.use(); // current language
	$scope.categories = []; // array of categories

	/* --Variables-- */


	/* Functions */

	// get the points and create the markers
	$scope.getPoints = function(zoom) {
		$scope.loading = true;
		var page = zoom - paramsCnst.initial_zoom;
		if (page < 0) {
			page = 0;
		}
		PointsService.getPoints(page, paramsCnst.limit_points).then(function(data) {
			for (var i in data) {
				createMarker(data[i]);
			}
			$scope.filter();
			if (!param_id) {
				GoogleMapsFactory.fitMapToMarkers();
			}
			$rootScope.map_ready = true;
			$scope.loading = false;
		}, function(response) {
			$scope.loading = false;
		});
	};

	// open the marker infowindow
	$scope.openMarkerInfowindow = function(point_id) {
		$scope.point = {};
		GoogleMapsFactory.closeInfowindow('cluster');
		PointsService.getPoint(point_id).then(function(point) {
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
			checkMenu();
		});
	};

	// toggle menu
	$scope.toggleMenu = function() {
		$rootScope.menu_opened = !$rootScope.menu_opened;
		$('#toggle').toggleClass('on');
		$('#menu').slideToggle('fast', function() {
			if (window.innerWidth > min_width_menu) {
				resizeMap();
			}
		});
		var offset_width_menu = $('#menu').outerWidth(true),
			sign = $rootScope.menu_opened ? '+=' : '-=';
		$('#menu_twitter').animate({
			right: sign + offset_width_menu + 'px'
		}, 350);
		$('#cont_twitter').animate({
			right: sign + offset_width_menu + 'px'
		}, 350);
		if ($rootScope.menu_opened && window.innerWidth < min_width_both && $rootScope.twitter_opened) {
			$scope.toggleTwitter();
		}
	};

	// toggle twitter
	$scope.toggleTwitter = function() {
		$rootScope.twitter_opened = !$rootScope.twitter_opened;
		$('.btn_hide').toggleClass('fa-angle-double-up');
		$('.btn_hide').toggleClass('fa-angle-double-down');
		$('#cont_twitter').slideToggle('fast', function() {
			if ($rootScope.twitter_opened && window.innerWidth < min_width_both && $rootScope.menu_opened) {
				$scope.toggleMenu();
			} else {
				resizeMap();
			}
		});
	};

	// remove all markers and place only the filtered ones
	$scope.filter = function(close_menu) {
		var filtered_ids = [],
			count = 0,
			results_ids;
		if ($rootScope.results && $rootScope.results.length > 0) {
			results_ids = $rootScope.results.map(function(el) {
				return el.id;
			});
			filtered_ids = PointsService.filter($rootScope.selected_categories, $rootScope.show.only_top, results_ids);
			for (var i in $rootScope.results) {
				if (filtered_ids.indexOf($rootScope.results[i].id) != -1) {
					$rootScope.results[i].visible = true;
					count++;
				} else {
					$rootScope.results[i].visible = false;
				}
			}
			$rootScope.num_results = count;
		} else {
			$rootScope.num_results = 0;
			filtered_ids = PointsService.filter($rootScope.selected_categories, $rootScope.show.only_top);
		}
		GoogleMapsFactory.filterMarkers(filtered_ids);
		if (close_menu) {
			checkMenu();
		}
	};

	// set all values of selected categories
	$scope.selectAll = function(value) {
		for (var i in $rootScope.selected_categories) {
			$rootScope.selected_categories[i] = value;
		}
		$scope.filter();
		checkMenu();
	};

	// change language
	$scope.changeLanguage = function(lang) {
		GoogleMapsFactory.closeInfowindow('marker');
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

	// when pressed enter, search
	$scope.typing = function(event) {
		if (event.which === 13) {
			$('#search_input').blur();
			$scope.search($scope.search_query);
		}
	};

	// search from server
	$scope.search = function(query) {
		if ($scope.searching) {
			searching_promise.abort();
		}
		$scope.searching = true;
		$rootScope.got_results = false;
		$scope.no_results = false;
		$scope.loading_results = false;
		$rootScope.results = [];
		if (query.length > 0) {
			var prev = false;
			searching_promise = PointsService.search(query, false);
			searching_promise.then(function(resp) {
				if (resp) {
					GoogleMapsFactory.closeInfowindow('marker');
					var results = resp.results;
					for (var i in resp.new_points) {
						createMarker(resp.new_points[i]);
					}
					if (query.length > 15) {
						query = query.substr(0, 15) + '...';
					}
					$rootScope.searched = query;
					$rootScope.results = results;
					$scope.filter();
					$scope.searching = false;
					$rootScope.got_results = true;
					if (!prev && $rootScope.num_results > 0) {
						GoogleMapsFactory.fitMapToMarkers();
					}
				}
			}, function(error) {
				console.log(error);
			}, function(update) {
				$rootScope.results = update;
				$scope.filter();
				if ($rootScope.num_results > 0) {
					prev = true;
					GoogleMapsFactory.fitMapToMarkers();
				}
			});
		}
	};

	// remove query and results
	$scope.removeSearch = function() {
		if ($scope.searching) {
			searching_promise.abort();
		}
		$scope.no_results = false;
		$scope.search_query = '';
		$scope.searching = false;
		$rootScope.got_results = false;
		$rootScope.results = [];
		$scope.filter();
	};
	
	// fit map to markers
	$scope.fitMarkers = function() {
		GoogleMapsFactory.fitMapToMarkers();
	}

	/* --Functions-- */


	/* Initialization */

	// preferred language
	if (!$translate.use()) {
		$translate.use($translate.preferredLanguage());
		$scope.current_language = $translate.preferredLanguage();
	}

	// if not set, show all
	if (typeof $rootScope.show === 'undefined') {
		$rootScope.show = {
			only_top: false
		};
	}

	// selected categories
	if (!$rootScope.selected_categories) {
		$rootScope.selected_categories = {};
	}
	// get categories and then initial points
	PointsService.getCategories().then(function(categories) {
		$scope.categories = categories;
		// initially all categories are selected
		for (var i in $scope.categories) {
			if (typeof($rootScope.selected_categories[$scope.categories[i].category]) === 'undefined') {
				$rootScope.selected_categories[$scope.categories[i].category] = true;
			}
		}
		// get initial points
		$scope.getPoints(paramsCnst.initial_zoom);
	});

	// watch for changes in location search
	$scope.$watch($location.search(), function() {
		param_id = $location.search().id;
		if (typeof param_id !== 'undefined') {
			openPreviousInfoWindow(param_id);
		}
	}, true);

	// on resize show/hide twitter widget
	$(window).resize(function() {
		showTwitter();
	});

	// if map is not initialized
	if (!$rootScope.map_ready) {
		// initialize map
		GoogleMapsFactory.initializeMap(document.getElementById('map'));
		// add listeners
		addListeners();
	} else {
		GoogleMapsFactory.moveMap('#map');
	}

	// wait for dom ready
	$timeout(function() {
		if (window.innerWidth > min_width_both) {
			if (typeof($rootScope.menu_opened) === 'undefined' || $rootScope.menu_opened) {
				$rootScope.menu_opened = false; // it will be toggled to true
				$scope.toggleMenu();
			}
			if (typeof($rootScope.twitter_opened) === 'undefined' || $rootScope.twitter_opened) {
				$rootScope.twitter_opened = false; // it will be toggled to true
				$scope.toggleTwitter();
			}
		} else {
			if (window.innerWidth > min_width_menu) {
				if (typeof($rootScope.menu_opened) === 'undefined' || $rootScope.menu_opened) {
					$rootScope.menu_opened = false; // it will be toggled to true
					$scope.toggleMenu();
				}
			}
		}
		showTwitter();
	}, 700);

	/* --Initialization-- */


	/* Aux Functions */

	// add listeners to elements of the map
	function addListeners() {
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
			$translate(['points_here', 'avg_rating'], {
				num: count
			}).then(function(translations) {
				var content = '<div>' + translations.points_here + '. ' + translations.avg_rating + ': ' + avg_rating.toFixed(1) + '</div>';
				GoogleMapsFactory.openInfowindow('cluster', content, cluster.getCenter());
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
	}

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

	// open the marker infowindow of the point
	function openPreviousInfoWindow(point_id) {
		if (!$rootScope.map_ready) {
			setTimeout(function() {
				openPreviousInfoWindow(point_id);
			}, 500);
		} else {
			PointsService.getPoint(point_id).then(function(point) {
				createMarker(point);
				$scope.filter();
				$scope.openMarkerInfowindow(point_id);
			}, function() {
				$location.search({});
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
		GoogleMapsFactory.resize();
	}

	// show/hide twitter widget
	function showTwitter() {
		loadTwitterWidget();
		if (window.innerWidth > min_width_both) {
			if (window.innerWidth > min_width_twitter) {
				if (twitter_loaded) {
					$('#menu_twitter').show();
				} else {
					$('#menu_twitter').hide();
				}
			}
		} else {
			if (window.innerWidth > min_width_twitter) {
				if (twitter_loaded) {
					$('#menu_twitter').show();
					if ($rootScope.twitter_opened) {
						if (!$rootScope.menu_opened) {
							$rootScope.twitter_opened = false; // it will be toggled to true
						}
						$scope.toggleTwitter();
					}
				} else {
					$('#menu_twitter').hide();
				}
			} else {
				$('#menu_twitter').hide();
				if ($rootScope.twitter_opened) {
					$scope.toggleTwitter();
				}
			}
		}
		resizeMap();
	}

	// load twitter widget, if not loaded yet
	function loadTwitterWidget() {
		if (!twitter_loaded) {
			try {
				twttr.widgets.load(document.getElementById("twitter"));
				twitter_loaded = true;
			} catch (e) {
				console.log(e);
			}
		}
	}

	// change class result_selected of the results and scroll
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

	// close menu if screen is too small
	function checkMenu() {
		if (window.innerWidth < min_width_menu && $rootScope.menu_opened) {
			$scope.toggleMenu();
		}
	}

	/* --Aux Functions-- */

}]);