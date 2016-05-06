/* HomeCtrl */
SmartApp.controller('HomeCtrl', ['$scope', '$rootScope', '$location', '$compile', '$templateRequest', '$timeout', '$translate', 'GoogleMaps', 'PointsService', 'colorsCnst', 'RatingFactory', 'paramsCnst', function($scope, $rootScope, $location, $compile, $templateRequest, $timeout, $translate, GoogleMaps, PointsService, colorsCnst, RatingFactory, paramsCnst) {

	/* Variables */

	var loading = true,
		latlong_lyon = {
			lat: 45.7591739,
			lng: 4.8846752
		},
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
		};
	$scope.showFilter = true;
	$scope.languages = paramsCnst.languages;
	$scope.current_zoom =
		$scope.current_language = $translate.use();
	$scope.markers = [];
	$scope.group_markers = [];
	$scope.markers_clusters = null;
	$scope.infoWindow = GoogleMaps.createInfoWindow();
	$scope.infoWindow2 = GoogleMaps.createInfoWindow();
	$scope.categories = [];

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

	// open the info window
	$scope.openInfoWindow = function(point_id, options) {
		$scope.point = {};
		$scope.cluster = {};
		$scope.infoWindow.close();
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
			var content = '<div>' + options.count + ' points here. Avg rating: ' + options.rating + '</div>';
			$scope.infoWindow2.setContent(content);
			$scope.infoWindow2.setPosition(options.center);
			$scope.infoWindow2.open($scope.map);
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
		// if ($scope.markers_clusters) {
		$scope.markers_clusters.clearMarkers();
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
	$scope.$watch(function() {
		return $location.search();
	}, function() {
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
		$scope.map = GoogleMaps.createMap(document.getElementById('map'), {
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
	}, 500);

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

	function createGroupMarker(group) {
		if (!$scope.group_markers[group.name]) {
			var marker = GoogleMaps.createMarker({
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
/* --HomeCtrl-- */

/* -------------------------------------------------- */


/* PointCtrl */
SmartApp.controller('PointCtrl', ['$scope', '$routeParams', '$location', '$translate', 'PointsService', 'RatingFactory', 'ChartFactory', 'paramsCnst', function($scope, $routeParams, $location, $translate, PointsService, RatingFactory, ChartFactory, paramsCnst) {

	/* Variables */

	var id = $routeParams.id,
		searchParam = $location.search(),
		param_zoom = searchParam.z,
		stats_sources = ['all3', 'twitter', 'foursquare', 'yelp'];
	// stats_sources = ['all3'];
	$scope.showFilter = false;
	$scope.languages = paramsCnst.languages;
	$scope.current_language = $translate.use();

	/* --Variables-- */


	/* Initialization */

	// preferred language
	if (!$translate.use()) {
		$translate.use($translate.preferredLanguage());
		$scope.current_language = $translate.preferredLanguage();
	}

	if (!param_zoom) {
		param_zoom = paramsCnst.initial_zoom;
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
		for (var i in stats_sources) {
			drawCharts(stats_sources[i]);
		}
		// drawChart();
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
		$translate.use(lang).then(function() {
			$scope.url_translate_schedule = null;
			$scope.url_translate_address = null;
			$scope.current_language = lang;
			externalTranslate();
			for (var i in stats_sources) {
				drawCharts(stats_sources[i]);
			}
		});
	};

	/* --Functions-- */



	/* Aux Functions */

	// set url of translate with google for schedule, address
	function externalTranslate() {
		if ($scope.current_language != paramsCnst.original_language) {
			var url = 'https://translate.google.com/#' + paramsCnst.original_language + '/' + $scope.current_language + '/';
			$scope.url_translate_schedule = url + encodeURI($scope.point.schedule);
			$scope.url_translate_address = url + encodeURI($scope.point.address);
		}
	}

	function drawChart() {
		PointsService.getAllHistory(id, 30).then(function(sources_data) {
			$translate(['rating', 'count', 'date']).then(function(translations) {
				var data = [],
					all_data = [];
				for (var i in sources_data) {
					data[i] = {};
					data[i].date = sources_data[i].date;
					var weights = 0,
						total = 0;
					if (sources_data[i].twitter_rating !== 0) {
						total += 4 * sources_data[i].twitter_rating;
						weights += 4;
					}
					if (sources_data[i].foursquare_rating !== 0) {
						total += 3 * (sources_data[i].foursquare_rating / 2);
						weights += 3;
					}
					if (sources_data[i].yelp_rating !== 0) {
						total += 3 * sources_data[i].yelp_rating;
						weights += 3;
					}
					if (weights > 0) {
						data[i].rating = Math.round((total / weights) * 100) / 100;
					}
					data[i].count = sources_data[i].twitter_count + sources_data[i].foursquare_count + sources_data[i].yelp_count;
				}
				all_data.push(data);
				$scope.all_chart_rating = ChartFactory.newChartDatePropertyMultiple(all_data, 'rating', {
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

				/*$scope.all_chart_rating = {
				"type": 'LineChart',
				"options": {
					"title": translations.rating,
					series: {
						0: { lineWidth: 4}
					}
				},
				"data": {
					"cols": [{
						id: "date",
						label: translations.date,
						type: "string"
					}, {
						id: 'a_rating',
						label: 'a_rating',
						type: "number"
					}, {
						id: 'fs_rating',
						label: 'fs_rating',
						type: "number"
					}, {
						id: 'y_rating',
						label: 'y_rating',
						type: "number"
					}, {
						id: 't_rating',
						label: 't_rating',
						type: "number"
					}],
					"rows": [{
						"c": [
							{ "v": new Date(sources_data[0].date).toLocaleDateString($scope.current_language, { day: 'numeric', month: 'short', year: 'numeric' }) },
							{ "v": data[0].rating },
							{ "v": sources_data[0].twitter_rating },
							{ "v": sources_data[0].foursquare_rating },
							{ "v": sources_data[0].yelp_rating },
						]
					},{
						"c": [
							{ "v": new Date(sources_data[1].date).toLocaleDateString($scope.current_language, { day: 'numeric', month: 'short', year: 'numeric' }) },
							{ "v": data[1].rating },
							{ "v": sources_data[1].twitter_rating },
							{ "v": sources_data[1].foursquare_rating },
							{ "v": sources_data[1].yelp_rating },
						]
					}]
				}
			};*/
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
							$translate(['rating', 'count', 'date', 'twitter', 'foursquare', 'yelp', 'overall']).then(function(translations) {
								var data = [],
									all_data = [],
									data_fs = [],
									i;
								for (i in data_foursquare) {
									data_fs[i] = {};
									data_fs[i].count = data_foursquare[i].count;
									data_fs[i].date = data_foursquare[i].date;
									data_fs[i].rating = data_foursquare[i].rating / 2;
								}
								for (i in data_fs) {
									data[i] = {};
									data[i].date = data_fs[i].date;
									var weights = 0,
										total = 0;
									if (data_twitter[i].rating !== 0) {
										total += 4 * data_twitter[i].rating;
										weights += 4;
									}
									if (data_fs[i].rating !== 0) {
										total += 3 * data_fs[i].rating;
										weights += 3;
									}
									if (data_yelp[i].rating !== 0) {
										total += 3 * data_yelp[i].rating;
										weights += 3;
									}
									if (weights > 0) {
										data[i].rating = Math.round((total / weights) * 100) / 100;
									}
									/* else {
																			data[i].rating = 0;
																		}*/
									data[i].count = data_twitter[i].count + data_fs[i].count + data_yelp[i].count;
								}
								all_data.push({
									label: translations.overall,
									color: 'green',
									data: data
								});
								all_data.push({
									label: translations.twitter,
									color: '#1DA1F2',
									data: data_twitter
								});
								all_data.push({
									label: translations.foursquare,
									color: '#2D5BE3',
									data: data_fs
								});
								all_data.push({
									label: translations.yelp,
									color: '#C41200',
									data: data_yelp
								});
								$scope.all_chart_rating = ChartFactory.newChartDatePropertyMultiple(all_data, 'rating', {
									title: translations.rating,
									label_date: translations.date,
									label_property: translations.rating,
									language: $scope.current_language,
									step: 0.4,
									max: 5
								});
								$scope.all_chart_count = ChartFactory.newChartDatePropertyMultiple(all_data, 'count', {
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
				if (x !== 0 && y !== 0) {
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
