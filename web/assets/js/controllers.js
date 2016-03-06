var ctrl = angular.module('SmartControllers', []);

ctrl.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
	console.log('MainCtrl');
	var initial_zoom = 12;
	var points = [];
	var markers = [];
	var pages_loaded = [];
	map = new google.maps.Map(document.getElementById('map'), {
		// center: { lat: 45.737646, lng: 4.8965753 },
		center: { lat: 45.7591739, lng: 4.8846752 },
		zoom: initial_zoom
	});
	getPoints(initial_zoom);
	map.addListener('zoom_changed', function() {
		getPoints(map.getZoom());
	});
	// map.addListener('bounds_changed',function() {
	// 	console.log(map.getBounds());
	// });

	function getPoints(zoom) {
		var marker, point;
		var page = zoom - initial_zoom;
		if (page < 0) {
			page = 0;
		}
		console.log('page:' + page);
		setMarkers(page);
		if (pages_loaded.indexOf(page) == -1) {
			markers[page] = [];
			$http.get('/points/getPoints?page=' + (page + 1))
				.success(function(data) {
					if (data) {
						for (var i in data) {
							point = data[i];
							point_id = points.map(function(e) {
								return e.id;
							}).indexOf(point.id);
							if (point_id == -1) {
								points.push(point);
								marker = new google.maps.Marker({
									position: {
										lat: parseFloat(point.latitude),
										lng: parseFloat(point.longitude)
									},
									title: point.name,
									label: point.sentiment.toString()
								});
								markers[page][point.id] = marker;
								markers[page][point.id].setMap(map);
							}
						}
						pages_loaded.push(page);
						console.log(points.length);
					}
				}).error(function(error) {
					console.log(error);
				});
		}

	}

	function setMarkers(page) {
		setMapOn(markers, null);
		var markers_page = markers.slice(0, page + 1);
		setMapOn(markers_page, map);
	}

	function setMapOn(markers_map, new_map) {
		for (var page in markers_map) {
			for (var i in markers_map[page]) {
				markers_map[page][i].setMap(new_map);
			}
		}
	}
}]);
