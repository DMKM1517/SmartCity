SmartApp.controller('PointController', ['$scope', '$routeParams', '$location', '$timeout', '$translate', 'PointsService', 'RatingFactory', 'ChartFactory', 'paramsCnst', function($scope, $routeParams, $location, $timeout, $translate, PointsService, RatingFactory, ChartFactory, paramsCnst) {

	/* Variables */

	var id = $routeParams.id, // point id
		// stats_sources = ['all', 'twitter', 'foursquare', 'yelp'];
		stats_sources = ['all']; // sources to plot
	$scope.show_filter = false; // don't show the menu
	$scope.languages = paramsCnst.languages; // available languages
	$scope.current_language = $translate.use(); // current language

	/* --Variables-- */


	/* Initialization */

	// preferred language
	if (!$translate.use()) {
		$translate.use($translate.preferredLanguage());
		$scope.current_language = $translate.preferredLanguage();
	}

	// get the information of the point
	PointsService.getPoint(id).then(function(data) {
		$scope.point = data;
		if (!$scope.point.rating) {
			$scope.point.rating = 0;
		}
		$scope.RF = RatingFactory.getRatingsAndClass($scope.point.rating);
		// set links to external translation
		externalTranslate();
		// wait for dom ready and render rating stars
		$timeout(function() {
			$('.rating').rating();
		});
		// draw charts of all sources
		for (var i in stats_sources) {
			drawCharts(stats_sources[i]);
		}
		// drawChart();
	}, function() {
		// if error
		$scope.point = {
			name: 'Point not found'
		};
	});

	/* --Initialization-- */


	/* Functions */

	// go back to map with parameters id
	$scope.back = function() {
		$location.path('/').search({
			id: id
		});
	};

	// change language
	$scope.changeLanguage = function(lang) {
		$translate.use(lang).then(function() {
			$scope.url_translate_schedule = null;
			$scope.url_translate_address = null;
			$scope.current_language = lang;
			externalTranslate();
			// draw charts with the new language
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

	/*function drawChart() {
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

			});
		});
	}*/

	// get history data and set chart object
	function drawCharts(source) {
		switch (source) {
			case 'all':
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
