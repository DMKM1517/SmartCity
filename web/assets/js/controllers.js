var ctrl = angular.module('SmartControllers', []);

ctrl.controller('MainCtrl', function($scope, $http) {
	console.log('MainCtrl');
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 45.737646, lng: 4.8965753 },
		zoom: 12
	});
	$http.get('/points/getPoints?level=13').success(function(data) {
		var marker;
		for (var i in data) {
			marker = new google.maps.Marker({
				position: {
					lat:parseFloat(data[i].latitude), 
					lng:parseFloat(data[i].longitude)
				},
				title: data[i].name
			});
			marker.setMap(map);
		}
	}).error(function(error) {
		console.log(error);
	});
	map.addListener('zoom_changed',function() {
		console.log(map.getZoom());
	});
	// map.addListener('bounds_changed',function() {
	// 	console.log(map.getBounds());
	// });
});
