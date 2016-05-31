SmartApp.factory('GoogleMapsFactory', ['colorsCnst', 'colorsTextCnst', 'paramsCnst', function(colorsCnst, colorsTextCnst, paramsCnst) {
	var _factory,
		_map,
		_clusters,
		_markers = [],
		_infowindows = {
			marker: new google.maps.InfoWindow(),
			cluster: new google.maps.InfoWindow()
		},
		opt_clusters = paramsCnst.opt_markers_clusters; // options for markers clusterer

	// setup the styles for markers clusterer
	opt_clusters.styles = [];
	for (var i in colorsCnst) {
		opt_clusters.styles.push({
			url: '/images/map_markers/m_small_' + colorsCnst[i] + '.png',
			height: 49,
			width: 48,
			textColor: colorsTextCnst[i]
		});
		opt_clusters.styles.push({
			url: '/images/map_markers/m_medium_' + colorsCnst[i] + '.png',
			height: 54,
			width: 53,
			textColor: colorsTextCnst[i]
		});
		opt_clusters.styles.push({
			url: '/images/map_markers/m_large_' + colorsCnst[i] + '.png',
			height: 66,
			width: 65,
			textColor: colorsTextCnst[i]
		});
	}

	// object to return
	_factory = {
		initializeMap: function(element) {
			// create map
			_map = new google.maps.Map(element, {
				center: paramsCnst.initial_latlng,
				zoom: paramsCnst.initial_zoom
			});
			// create marker clusterer
			_clusters = new MarkerClusterer(_map, null, opt_clusters);
			// set calculator for cluster icon
			_clusters.setCalculator(function(markers, numStyles) {
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
		},
		addListener: function(element, event, callback) {
			switch (element) {
				case 'map':
					_map.addListener(event, callback);
					break;
				case 'infowindow_marker':
					_infowindows.marker.addListener(event, callback);
					break;
				case 'markers_clusters':
					_clusters.addListener(event, callback);
					break;
			}
		},
		getZoom: function() {
			return _map.getZoom();
		},
		setZoom: function(zoom) {
			if (isInt(zoom) && zoom > 0) {
				_map.setZoom(zoom);
			} else if (zoom.substr(0, 1) == '+' || zoom.substr(0, 1) == '-') {
				_map.setZoom(_map.getZoom() + parseInt(zoom));
			}
		},
		openInfowindow: function(infowindow, content, position) {
			_infowindows[infowindow].setContent(content);
			if (isInt(position)) {
				_map.panTo(_markers[position].getPosition());
				if (_markers[position].getMap() === null) {
					_map.setZoom(paramsCnst.initial_zoom);
					_clusters.repaint();
					var c = 0;
					while (_markers[position].getMap() === null && c < 10) {
						_map.setZoom(_map.getZoom() + 1);
						_clusters.repaint();
						c++;
					}
				}
				_infowindows[infowindow].open(_map, _markers[position]);
			} else {
				_infowindows[infowindow].setPosition(position);
				_infowindows[infowindow].open(_map);
			}
		},
		closeInfowindow: function(infowindow) {
			_infowindows[infowindow].close();
		},
		fitBounds: function(bounds) {
			_map.fitBounds(bounds);
		},
		createMarker: function(options_marker, id, rating, click_callback) {
			if (!_markers[id]) {
				var marker = new google.maps.Marker(options_marker),
					url = '/images/map_markers/',
					r = Math.floor(rating);
				if (r < 0) {
					r = 0;
				} else if (r > 4) {
					r = 4;
				}
				marker.setIcon({
					url: url + colorsCnst[r] + '.png',
					scaledSize: new google.maps.Size(23, 23),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(9, 11)
				});
				marker.rating = rating || 0;
				_markers[id] = marker;
			}
			if (click_callback) {
				_markers[id].addListener('click', click_callback);
			}
		},
		resize: function() {
			google.maps.event.trigger(_map, "resize");
		},
		filterMarkers: function(filtered_ids) {
			var filtered_markers = [];
			for (var id in _markers) {
				for (var i in filtered_ids) {
					if (id == filtered_ids[i]) {
						filtered_markers.push(_markers[id]);
					}
				}
			}
			_clusters.clearMarkers();
			_clusters.addMarkers(filtered_markers);
		},
		fitMapToMarkers: function() {
			_clusters.fitMapToMarkers();
		},
		moveMap: function(selector) {
			$(selector).replaceWith(_map.getDiv());
			for (var i in _markers) {
				google.maps.event.clearListeners(_markers[i], 'click');
			}
		},
	};

	return _factory;

	function isInt(value) {
		var x;
		if (isNaN(value)) {
			return false;
		}
		x = parseFloat(value);
		return (x | 0) === x;
	}
}]);