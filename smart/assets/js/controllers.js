var ctrl = angular.module('SmartControllers',[]);

ctrl.controller('MainCtrl', function($scope) {
	console.log('MainCtrl');
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 45.737646, lng: 4.8965753},
		zoom: 13
	});
});