/* MainCtrl */
SmartApp.controller('MainCtrl', ['$scope', '$rootScope', '$location', '$translate', 'GoogleMaps', 'PointsService', 'colorsCnst', 'RatingFactory', 'languagesCnst', function($scope, $rootScope, $location, $translate, GoogleMaps, PointsService, colorsCnst, RatingFactory, languagesCnst) {

	/* Variables */

	var initial_zoom = 12;
	var limit = 100;
	var loading = true;
	var latlong = {
		lat: 45.7591739,
		lng: 4.8846752
	};
	var current_zoom = initial_zoom;
	var original_language = 'fr';
	$scope.showFilter = true;
	$scope.languages = languagesCnst;
	$scope.current_language = $translate.use();
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
			$translate(['address', 'web', 'schedule', 'more_information', 'translate_google', point.category]).then(function(translations) {
				var content = '<div class="info_window">' +
					'<div class="row">' +
					'<div class="col-xs-9">' +
					'<h4>' + point.name + '</h4>' +
					'<div class="category">' + translations[point.category] + '</div>' +
					'</div>' +
					'<div class="col-xs-3">' +
					'<div class="stars pull-right ' + RF.star_class + '">' +
					'<input type="hidden" class="rating" data-fractions="2" value="' + RF.rating2 + '" data-readonly/>' +
					'</div>' +
					'<div class="rating_number">' +
					RF.rating1 +
					'</div>' +
					'</div>' +
					'</div>';
				if (point.address) {
					content += '<b>' + translations.address + ':</b> ' + point.address + '<br>';
				}
				if (point.web) {
					var links = point.web.split(';');
					content += '<b>' + translations.web + ':</b> ';
					for (var i in links) {
						content += '<a href="' + links[i] + '" target="_blank">' + links[i] + '</a><br>';
					}
				}
				if (point.schedule) {
					content += '<b>' + translations.schedule + ':</b> ' + point.schedule;
					if ($scope.current_language != original_language) {
						var url_translate = 'https://translate.google.com/#' + original_language + '/' + $scope.current_language + '/' + encodeURI(point.schedule);
						content += ' [<a href="' + url_translate + '" target="_blank">' +
							translations.translate_google +
							' <i class="fa fa-external-link"></i>' +
							'</a>]';
					}
				}
				if (content.endsWith('<br>')) {
					content = content.slice(0, -4);
				}
				content += '<div class="row">' +
					'<div class="pull-right">' +
					'<a href="#/point/' + point.id + '?z=' + $scope.map.getZoom() + '">' + translations.more_information + '</a>' +
					'</div>' +
					'</div>' +
					'</div>';
				$scope.infoWindow.setContent(content);
				$scope.infoWindow.open($scope.map, $scope.markers[point_id]);
			});
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

	// change language
	$scope.changeLanguage = function(lang) {
		$translate.use(lang);
		$scope.infoWindow.close();
		$scope.current_language = lang;
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

	// open menu if the window is big enough and initialize twitter widget
	setTimeout(function() {
		if ($(document).width() > 700) {
			$scope.toggleMenu();
		}
		if ($(document).height() > 600) {
			twttr.widgets.load(document.getElementById("twitter"));
		}
	}, 1000);

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

/* -------------------------------------------------- */


/* PointCtrl */
SmartApp.controller('PointCtrl', ['$scope', '$routeParams', '$location', '$translate', 'PointsService', 'RatingFactory', 'ChartFactory', 'languagesCnst', function($scope, $routeParams, $location, $translate, PointsService, RatingFactory, ChartFactory, languagesCnst) {

	/* Variables */

	var initial_zoom = 12,
		id = $routeParams.id,
		searchParam = $location.search(),
		param_zoom = searchParam.z,
		original_language = 'fr',
		stats_sources = ['twitter', 'foursquare', 'yelp'];
	$scope.showFilter = false;
	$scope.languages = languagesCnst;
	$scope.current_language = $translate.use();

	/* --Variables-- */


	/* Initialization */

	// preferred language
	if (!$translate.use()) {
		$translate.use($translate.preferredLanguage());
		$scope.current_language = $translate.preferredLanguage();
	}

	if (!param_zoom) {
		param_zoom = initial_zoom;
	}

	// get the information of the point
	PointsService.getPoint(id).then(function(data) {
		$scope.point = data;
		$scope.RF = RatingFactory.getRatingsAndClass($scope.point.rating);
		// set links to external translation
		externalTranslate();
		setTimeout(function() {
			$('.rating').rating();
		}, 100);
		// draw charts of all sources
		// for (var i in stats_sources) {
		// 	drawCharts(stats_sources[i]);
		// }
		drawChart();
	}, function() {
		$scope.point = {
			name: 'Point not found'
		};
	});

	/* --Initialization-- */


	/* Functions */

	// go back to map with parameters id and zoom
	$scope.back = function() {
		$location.path('/').search({
			id: id,
			z: param_zoom
		});
	};

	// change language
	$scope.changeLanguage = function(lang) {
		$translate.use(lang);
		$scope.url_translate_schedule = null;
		$scope.url_translate_address = null;
		$scope.current_language = lang;
		externalTranslate();
		// for (var i in stats_sources) {
		// 	drawCharts(stats_sources[i]);
		// }
	};

	/* --Functions-- */



	/* Aux Functions */

	// set url of translate with google for schedule, address
	function externalTranslate() {
		if ($scope.current_language != original_language) {
			var url = 'https://translate.google.com/#' + original_language + '/' + $scope.current_language + '/';
			$scope.url_translate_schedule = url + encodeURI($scope.point.schedule);
			$scope.url_translate_address = url + encodeURI($scope.point.address);
		}
	}

	function drawChart() {
		PointsService.getAllHistory(id, 30).then(function(all_data) {
			$translate(['rating', 'count', 'date']).then(function(translations) {
				var data = [];
				for (var i in all_data) {
					data[i] = {};
					data[i].date = all_data[i].date;
					var weights = 0,
						total = 0;
					if (all_data[i].twitter_rating !== 0) {
						total += 4 * all_data[i].twitter_rating;
						weights += 4;
					}
					if (all_data[i].foursquare_rating !== 0) {
						total += 3 * (all_data[i].foursquare_rating / 2);
						weights += 3;
					}
					if (all_data[i].yelp_rating !== 0) {
						total += 3 * all_data[i].yelp_rating;
						weights += 3;
					}
					if (weights > 0) {
						data[i].rating = Math.round((total / weights) * 100) / 100;
					}
					/* else {
											data[i].rating = 0;
										}*/
					data[i].count = all_data[i].twitter_count + all_data[i].foursquare_count + all_data[i].yelp_count;

				}
				$scope.all_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
					title: translations.rating,
					label_date: translations.date,
					label_property: translations.rating,
					language: $scope.current_language,
					step: 0.4,
					max: 5
				});
				$scope.all_chart_count = ChartFactory.newChartDateProperty(data, 'count', {
					title: translations.count,
					label_date: translations.date,
					label_property: translations.count,
					language: $scope.current_language,
					step: 2
				});
				$scope.all_rating_measures = {
					avg: measureValue(data, 'rating', 'avg').toFixed(1),
					min: measureValue(data, 'rating', 'min'),
					max: measureValue(data, 'rating', 'max'),
				};
				$scope.all_count_measures = {
					avg: Math.round(measureValue(data, 'count', 'avg')),
				};
			});
		});
	}

	// get history data and set chart object
	function drawCharts(source) {
		switch (source) {
			case 'all1':
				PointsService.getHistory(id, 'twitter').then(function(data_twitter) {
					PointsService.getHistory(id, 'foursquare').then(function(data_foursquare) {
						PointsService.getHistory(id, 'yelp').then(function(data_yelp) {
							$translate(['rating', 'count', 'date']).then(function(translations) {
								var data = [];
								for (var i in data_twitter) {
									data[i] = {};
									data[i].date = data_twitter[i].date;
									var num_sources = 0,
										total = 0;
									if (data_twitter[i].rating !== 0) {
										total += data_twitter[i].rating;
										num_sources++;
									}
									if (data_foursquare[i].rating !== 0) {
										total += data_foursquare[i].rating / 2;
										num_sources++;
									}
									if (data_yelp[i].rating !== 0) {
										total += data_yelp[i].rating;
										num_sources++;
									}
									if (num_sources > 0) {
										data[i].rating = Math.round((total / num_sources) * 100) / 100;
									} else {
										data[i].rating = 0;
									}
									data[i].count = data_twitter[i].count + data_foursquare[i].count + data_yelp[i].count;

								}
								$scope.all_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
									title: translations.rating,
									label_date: translations.date,
									label_property: translations.rating,
									language: $scope.current_language,
									step: 0.4,
									max: 5
								});
								$scope.all_chart_count = ChartFactory.newChartDateProperty(data, 'count', {
									title: translations.count,
									label_date: translations.date,
									label_property: translations.count,
									language: $scope.current_language,
									step: 2
								});
								$scope.all_rating_measures = {
									avg: measureValue(data, 'rating', 'avg').toFixed(1),
									min: measureValue(data, 'rating', 'min'),
									max: measureValue(data, 'rating', 'max'),
								};
								$scope.all_count_measures = {
									avg: Math.round(measureValue(data, 'count', 'avg')),
								};
							});
						});
					});
				});
				break;
			case 'all2':
				PointsService.getHistory(id, 'twitter').then(function(data_twitter) {
					PointsService.getHistory(id, 'foursquare').then(function(data_foursquare) {
						PointsService.getHistory(id, 'yelp').then(function(data_yelp) {
							$translate(['rating', 'count', 'date']).then(function(translations) {
								var data = [];
								for (var i in data_twitter) {
									data[i] = {};
									data[i].date = data_twitter[i].date;
									var num_sources = 0,
										total = 1;
									if (data_twitter[i].rating !== 0) {
										total *= data_twitter[i].rating;
										num_sources++;
									}
									if (data_foursquare[i].rating !== 0) {
										total *= data_foursquare[i].rating / 2;
										num_sources++;
									}
									if (data_yelp[i].rating !== 0) {
										total *= data_yelp[i].rating;
										num_sources++;
									}
									if (num_sources > 0) {
										data[i].rating = Math.round((Math.pow(total, 1 / num_sources)) * 100) / 100;
									} else {
										data[i].rating = 0;
									}
									data[i].count = data_twitter[i].count + data_foursquare[i].count + data_yelp[i].count;

								}
								$scope.all2_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
									title: translations.rating,
									label_date: translations.date,
									label_property: translations.rating,
									language: $scope.current_language,
									step: 0.4,
									max: 5
								});
								$scope.all2_rating_measures = {
									avg: measureValue(data, 'rating', 'avg').toFixed(1),
									min: measureValue(data, 'rating', 'min'),
									max: measureValue(data, 'rating', 'max'),
								};
							});
						});
					});
				});
				break;
			case 'all3':
				PointsService.getHistory(id, 'twitter').then(function(data_twitter) {
					PointsService.getHistory(id, 'foursquare').then(function(data_foursquare) {
						PointsService.getHistory(id, 'yelp').then(function(data_yelp) {
							$translate(['rating', 'count', 'date']).then(function(translations) {
								var data = [];
								for (var i in data_twitter) {
									data[i] = {};
									data[i].date = data_twitter[i].date;
									var num_sources = 0,
										total = 0;
									if (data_twitter[i].rating !== 0) {
										total += 4 * data_twitter[i].rating;
										num_sources += 4;
									}
									if (data_foursquare[i].rating !== 0) {
										total += 3 * data_foursquare[i].rating / 2;
										num_sources += 3;
									}
									if (data_yelp[i].rating !== 0) {
										total += 3 * data_yelp[i].rating;
										num_sources += 3;
									}
									if (num_sources > 0) {
										data[i].rating = Math.round((total / num_sources) * 100) / 100;
									} else {
										data[i].rating = 0;
									}
									data[i].count = data_twitter[i].count + data_foursquare[i].count + data_yelp[i].count;

								}
								$scope.all3_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
									title: translations.rating,
									label_date: translations.date,
									label_property: translations.rating,
									language: $scope.current_language,
									step: 0.4,
									max: 5
								});
								$scope.all3_rating_measures = {
									avg: measureValue(data, 'rating', 'avg').toFixed(1),
									min: measureValue(data, 'rating', 'min'),
									max: measureValue(data, 'rating', 'max'),
								};
							});
						});
					});
				});
				break;
			case 'twitter':
				PointsService.getHistory(id, source).then(function(data) {
					$translate(['sentiment', 'count', 'date', 'tweets']).then(function(translations) {
						$scope.twitter_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
							title: translations.sentiment,
							label_date: translations.date,
							label_property: translations.sentiment,
							language: $scope.current_language,
							step: 0.5,
							max: 5
						});
						$scope.twitter_chart_count = ChartFactory.newChartDateProperty(data, 'count', {
							title: translations.tweets,
							label_date: translations.date,
							label_property: translations.count,
							language: $scope.current_language,
							step: 2
						});
					});
					$scope.twitter_rating_measures = {
						avg: measureValue(data, 'rating', 'avg').toFixed(1),
						min: measureValue(data, 'rating', 'min'),
						max: measureValue(data, 'rating', 'max'),
					};
					$scope.twitter_count_measures = {
						avg: Math.round(measureValue(data, 'count', 'avg')),
					};
				});
				break;
			case 'foursquare':
				PointsService.getHistory(id, source).then(function(data) {
					$translate(['rating', 'count', 'date', 'checkins']).then(function(translations) {
						$scope.fs_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
							title: translations.rating,
							label_date: translations.date,
							label_property: translations.rating,
							language: $scope.current_language,
							step: 0.5,
							max: 10
						});
						$scope.fs_chart_count = ChartFactory.newChartDateProperty(data, 'count', {
							title: translations.checkins,
							label_date: translations.date,
							label_property: translations.count,
							language: $scope.current_language,
							step: 2
						});
					});
					$scope.fs_rating_measures = {
						avg: measureValue(data, 'rating', 'avg').toFixed(1),
						min: measureValue(data, 'rating', 'min'),
						max: measureValue(data, 'rating', 'max'),
					};
					$scope.fs_count_measures = {
						avg: Math.round(measureValue(data, 'count', 'avg')),
					};
				});
				break;
			case 'yelp':
				PointsService.getHistory(id, source).then(function(data) {
					$translate(['rating', 'count', 'date', 'reviews']).then(function(translations) {
						$scope.yelp_chart_rating = ChartFactory.newChartDateProperty(data, 'rating', {
							title: translations.rating,
							label_date: translations.date,
							label_property: translations.rating,
							language: $scope.current_language,
							step: 0.5,
							max: 5
						});
						$scope.yelp_chart_count = ChartFactory.newChartDateProperty(data, 'count', {
							title: translations.reviews,
							label_date: translations.date,
							label_property: translations.count,
							language: $scope.current_language,
						});
					});
					$scope.yelp_rating_measures = {
						avg: measureValue(data, 'rating', 'avg').toFixed(1),
						min: measureValue(data, 'rating', 'min'),
						max: measureValue(data, 'rating', 'max'),
					};
					$scope.yelp_count_measures = {
						avg: Math.round(measureValue(data, 'count', 'avg')),
					};
				});
				break;
		}
	}

	// get value of a measure from data.property
	function measureValue(data, property, measure) {
		var values = 1;
		var mapreduce = data.map(function(elem) {
			return elem[property];
		}).reduce(function(x, y) {
			if (measure == 'avg') {
				if (!x) {
					x = 0;
				}
				if (!y) {
					y = 0;
				}
				if (x !==0 && y !==0) {
					values++;
				}
				return x + y;
			}
			if (!x) {
				return y;
			}
			if (!y) {
				return x;
			}
			return Math[measure](x, y);
		});
		if (measure == 'avg') {
			mapreduce /= values;
		}
		return mapreduce;
	}

	/* --Aux Functions-- */

}]);
/* --PointCtrl-- */

/* -------------------------------------------------- */
