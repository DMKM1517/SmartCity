/* PointsService */
SmartApp.service('PointsService', ['$http', '$q', function($http, $q) {
	var points = {},
		pages_loaded = [],
		history = {},
		all_history = {};

	// get points by page with limit
	this.getPoints = function(page, limit) {
		var ini = page * limit;
		var defer = $q.defer();
		if (pages_loaded.indexOf(page) == -1) {
			$http.get('/points/getPoints?page=' + (page + 1) + '&limit=' + limit).success(function(data) {
				if (data) {
					for (var i in data) {
						point = data[i];
						if (!points[point.id]) {
							points[point.id] = point;
						}
					}
					pages_loaded.push(page);
					defer.resolve(points);
					// defer.resolve(points.slice(ini, ini + limit));
				} else {
					defer.reject('no data');
				}
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points);
			// defer.resolve(points.slice(ini, ini + limit));
		}
		return defer.promise;
	};

	// get a point by id
	this.getPoint = function(id) {
		var defer = $q.defer();
		if (!points[id]) {
			$http.get('/points/' + id).success(function(point) {
				if (!points[point.id]) {
					points[point.id] = point;
				}
				defer.resolve(point);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(points[id]);
		}
		return defer.promise;
	};

	// get all categories
	this.getCategories = function() {
		var defer = $q.defer();
		$http.get('/points/getCategories').success(function(categories) {
			defer.resolve(categories);
		}).error(function(err) {
			defer.reject(err);
		});
		return defer.promise;
	};

	// filter by category
	this.filterCategories = function(selected_categories) {
		var filtered = [];
		for (var i in points) {
			var point = points[i];
			if (selected_categories[point.category]) {
				filtered.push(point.id);
			}
		}
		return filtered;
	};

	// history
	this.getHistory = function(id, source) {
		var defer = $q.defer();
		var url = '/ratings/getHistory?source=' + source + '&days=30&ip_id=' + id;
		if (!history[id]) {
			$http.get(url).success(function(data) {
				history = {};
				history[id] = {};
				history[id][source] = data;
				defer.resolve(history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else if (!history[id][source]) {
			$http.get(url).success(function(data) {
				history[id][source] = data;
				defer.resolve(history[id][source]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(history[id][source]);
		}
		return defer.promise;
	};


	this.getAllHistory = function(id, days) {
		var defer = $q.defer(),
			url = '/ratings/getAllHistory?ip_id=' + id + '&days=' + days;
		if (!all_history[id]) {
			$http.get(url).success(function(data) {
				all_history[id] = data;
				defer.resolve(all_history[id]);
			}).error(function(err) {
				defer.reject(err);
			});
		} else {
			defer.resolve(all_history[id]);
		}
		return defer.promise;
	};

}]);
/* --PointsService-- */



/* GoogleMaps */
SmartApp.factory('GoogleMaps', ['colorsCnst', function(colorsCnst) {
	return {
		createMap: function(element, options) {
			return new google.maps.Map(element, options);
		},
		createMarker: function(options, sentiment) {
			var marker = new google.maps.Marker(options);
			var sent = sentiment;
			if (sent < 0) {
				sent = 0;
			}
			if (sent > 4) {
				sent = 4;
			}
			marker.setIcon({
				url: '/images/map_markers/' + colorsCnst[sent] + '.png',
				scaledSize: new google.maps.Size(23, 23),
				origin: new google.maps.Point(-2, 0),
				anchor: new google.maps.Point(11, 11)
			});
			return marker;
		},
		createInfoWindow: function() {
			return new google.maps.InfoWindow();
		}
	};
}]);
/* --GoogleMaps-- */



/* RatingFactory */
SmartApp.factory('RatingFactory', ['colorsCnst', function(colorsCnst) {
	return {
		getRatingsAndClass: function(rating_full) {
			var rating = rating_full.toFixed(1);
			if (rating > 5) {
				rating = '5.0';
			}
			if (rating < 0) {
				rating = '0.0';
			}
			var tmp_rating = Math.floor(rating);
			var rating2 = (Math.floor(rating * 2) / 2).toFixed(1);
			var star_class = 'star_';
			if (tmp_rating >= 5) {
				tmp_rating = 4;
			}
			star_class += colorsCnst[tmp_rating];
			return { rating1: rating, rating2: rating2, star_class: star_class };
		}
	};
}]);
/* --RatingFactory-- */



/* ChartFactory */
SmartApp.factory('ChartFactory', function() {
	return {
		newChartDateProperty: function(data, property, options) {
			var _type = options.type || 'LineChart',
				_title = options.title || '',
				_label_date = options.label_date || 'Date',
				_label_property = options.label_property || '',
				_language = options.language || 'en',
				_min = options.min || 0,
				_step = options.step || 1,
				_max = options.max,
				rows = [],
				min_max = [];
			if (!data || !property) {
				throw "Missing arguments: data or property";
			}
			for (var i in data) {
				rows.push({
					"c": [
						{ "v": new Date(data[i].date).toLocaleDateString(_language, { day: 'numeric', month: 'short', year: 'numeric' }) },
						{ "v": data[i][property] }
					]
				});
			}
			min_max = minMaxValues(data, property, _min, _step, _max);
			return {
				"type": _type,
				"options": {
					"title": _title,
					"legend": "none",
					"vAxis": {
						"minValue": min_max[0],
						"maxValue": min_max[1]
					}
				},
				"data": {
					"cols": [{
						id: "date",
						label: _label_date,
						type: "string"
					}, {
						id: property,
						label: _label_property,
						type: "number"
					}],
					"rows": rows
				}
			};
		},
		newChartDatePropertyMultiple: function(all_data, property, options) {
			var _type = options.type || 'LineChart',
				_title = options.title || '',
				_label_date = options.label_date || 'Date',
				_label_property = options.label_property || '',
				_language = options.language || 'en',
				_min = options.min || 0,
				_step = options.step || 1,
				_max = options.max,
				cols = [{
					id: "date",
					label: _label_date,
					type: "string"
				}],
				rows = [],
				min_max = [],
				series = {
					0: {
						lineWidth: 4,
						color: 'green'
					}
				};
			if (!all_data || !property) {
				throw "Missing arguments: data or property";
			}
			for (var i in all_data) {
				cols.push({
					id: all_data[i].label + ' ' + property,
					label: all_data[i].label,
					type: "number"
				});
			}
			for (var j in all_data[0].data) {
				rows.push({
					"c": [
						{ "v": new Date(all_data[i].data[j].date).toLocaleDateString(_language, { day: 'numeric', month: 'short', year: 'numeric' }) },
						{ "v": all_data[0].data[j][property] }
					]
				});
			}
			for (i = 1; i < all_data.length; i++) {
				series[i.toString()] = {
					lineWidth: 1,
					color: all_data[i].color
				};
				for(j in all_data[i].data){
					rows[j].c.push({ "v": all_data[i].data[j][property] });
				}
			}
			// min_max = minMaxValues(data, property, _min, _step, _max);
			return {
				"type": _type,
				"options": {
					"title": _title,
					"series": series,
					/*"vAxis": {
						"minValue": min_max[0],
						"maxValue": min_max[1]
					}*/
				},
				"data": {
					"cols": cols,
					"rows": rows
				}
			};
		}
	};

	// get min and max values of data according to a property
	function minMaxValues(data, property, min_range, step, max_range) {
		var min = data.map(function(elem) {
			return elem[property];
		}).reduce(function(x, y) {
			if (!x) {
				return y;
			}
			if (!y) {
				return x;
			}
			return Math.min(x, y);
		}) - step;
		min = min < min_range ? min_range : min;
		var max = data.map(function(elem) {
			return elem[property];
		}).reduce(function(x, y) {
			if (!x) {
				return y;
			}
			if (!y) {
				return x;
			}
			return Math.max(x, y);
		}) + step;
		if (max_range) {
			max = max > max_range ? max_range : max;
		}
		return [min, max];
	}
});
/* --RatingFactory-- */
