SmartApp.factory('ChartFactory', ['$http', function($http) {
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
					"c": [{
						"v": new Date(data[i].date).toLocaleDateString(_language, {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})
					}, {
						"v": data[i][property]
					}]
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
					"c": [{
						"v": new Date(all_data[i].data[j].date).toLocaleDateString(_language, {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})
					}, {
						"v": all_data[0].data[j][property]
					}]
				});
			}
			for (i = 1; i < all_data.length; i++) {
				series[i.toString()] = {
					lineWidth: 1,
					color: all_data[i].color
				};
				for (j in all_data[i].data) {
					rows[j].c.push({
						"v": all_data[i].data[j][property]
					});
				}
			}
			// min_max = minMaxValues(data, property, _min, _step, _max);
			var vAxis = {
				viewWindowMode: 'explicit',
				viewWindow: {
					min: _min
				}
			};
			if (_max) {
				vAxis.viewWindow.max = _max;
			}
			return {
				"type": _type,
				"options": {
					"title": _title,
					"series": series,
					"vAxis": vAxis,
				},
				"data": {
					"cols": cols,
					"rows": rows
				}
			};
		},
		newChartMultiplePrediction: function(all_data, options) {
			var num_sources = all_data.length,
				_type = options.type || 'LineChart',
				_title = options.title || '',
				_label_date = options.label_date || 'Date',
				_label_prediction = options.label_prediction || 'Prediction',
				_start_time = new Date().getTime() - (35 * 24 * 60 * 60 * 1000),
				_prediction_days = options.prediction_days || 7,
				_language = options.language || 'en',
				_min = options.min || 0,
				_max = options.max,
				_cols = [{
					id: "date",
					label: _label_date,
					type: "string"
				}],
				_rows = [],
				_series = {
					0: {
						lineWidth: 4,
						color: all_data[0].color
					}
				},
				_vAxis = {
					viewWindowMode: 'explicit',
					viewWindow: {
						min: _min
					}
				},
				i,
				j;
			if (options.start_date) {
				_start_time = new Date(options.start_date).getTime();
			}
			if (_max) {
				_vAxis.viewWindow.max = _max;
			}
			for (i in all_data) {
				_cols.push({
					id: all_data[i].label,
					label: all_data[i].label,
					type: "number"
				});
			}
			for (i = 0; i < all_data[0].data.length + _prediction_days; i++) {
				_rows.push({
					"c": [{
						"v": new Date(_start_time + (i * 24 * 60 * 60 * 1000)).toLocaleDateString(_language, {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})
					}, {
						"v": all_data[0].data[i]
					}]
				});
			}
			for (i = 1; i < num_sources; i++) {
				_series[i.toString()] = {
					lineWidth: 1,
					color: all_data[i].color
				};
				for (j = 0; j < all_data[i].data.length; j++) {
					_rows[j].c.push({
						"v": all_data[i].data[j]
					});
				}
			}
			$http.post('/ratings/forecast', {
				data: all_data[0].data,
				period: 7,
				future: 7,
				alpha: 0.3,
				beta: 0.1,
				gamma: 0.05
			}).then(function(response) {
				if (response.data) {
					var predictions = response.data,
						valid_prediction = true;
					for (i = predictions.length - _prediction_days; i < predictions.length; i++) {
						if (!predictions[i]) {
							valid_prediction = false;
							break;
						}
					}
					if (valid_prediction) {
						_series[num_sources] = {
							lineDashStyle: [4, 2],
							color: '#14db05'
						};
						_cols.push({
							id: 'prediction',
							label: _label_prediction,
							type: 'number'
						});
						// uncomment to see the pattern of prediction
						// for (j = 0; j < predictions.length; j++) {
						for (j = all_data[0].data.length - 1; j < predictions.length; j++) {
							var prediction = parseFloat(+predictions[j].toFixed(2));
							if (prediction <= 0) {
								prediction = null;
							} else if (prediction > 5) {
								prediction = 5.0
							}
							_rows[j].c[num_sources + 1] = {
								"v": prediction
							};
						}
					}
				}
			}, function(error) {
				console.log('Failed to forecast');
			});
			return {
				"type": _type,
				"options": {
					"title": _title,
					"series": _series,
					"vAxis": _vAxis,
				},
				"data": {
					"cols": _cols,
					"rows": _rows
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
}]);