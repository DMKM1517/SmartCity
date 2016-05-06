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
				for (j in all_data[i].data) {
					rows[j].c.push({ "v": all_data[i].data[j][property] });
				}
			}
			// min_max = minMaxValues(data, property, _min, _step, _max);
			var vAxis = {
				minValue: _min
			};
			if (_max) {
				vAxis.maxValue = _max;
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