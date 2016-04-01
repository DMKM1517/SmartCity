describe('Service: PointsService', function() {
	var PointsService, httpBackend, q;
	beforeEach(function() {
		// main module app
		window.angular.mock.module('SmartApp');

		// templates html
		window.angular.mock.module('templates');
	});

	beforeEach(inject(function(_PointsService_, $httpBackend) {
		PointsService = _PointsService_;
		httpBackend = $httpBackend;
	}));

	it('gets points', function() {
		httpBackend.whenGET('/points/getPoints?page=1&limit=2').respond([{
			id: 0,
			name: 'point 0'
		}, {
			id: 1,
			name: 'point 1'
		}]);
		PointsService.getPoints(0, 2).then(function(data) {
			expect(data).to.eql({
				0: {
					id: 0,
					name: 'point 0'
				},
				1: {
					id: 1,
					name: 'point 1'
				}
			});
		});
		httpBackend.flush();
		PointsService.getPoints(0, 2).then(function(data) {
			expect(data).to.eql({
				0: {
					id: 0,
					name: 'point 0'
				},
				1: {
					id: 1,
					name: 'point 1'
				}
			});
		});
	});

	it('does not store duplicated points', function() {
		httpBackend.whenGET('/points/getPoints?page=1&limit=2').respond([{
			id: 0,
			name: 'point 0'
		}, {
			id: 0,
			name: 'point 1'
		}]);
		PointsService.getPoints(0, 2).then(function(data) {
			expect(data).to.eql({
				0: {
					id: 0,
					name: 'point 0'
				}
			});
		});
		httpBackend.flush();
	});

	it('gets one point', function() {
		httpBackend.whenGET('/points/0').respond({
			id: 0,
			name: 'point 0'
		});
		PointsService.getPoint(0).then(function(data) {
			expect(data).to.eql({
				id: 0,
				name: 'point 0'
			});
		});
		httpBackend.flush();
	});

	it('gets one point already stored', function() {
		httpBackend.whenGET('/points/getPoints?page=1&limit=2').respond([{
			id: 0,
			name: 'point 0'
		}, {
			id: 1,
			name: 'point 1'
		}]);
		PointsService.getPoints(0, 2);
		httpBackend.flush();
		PointsService.getPoint(0).then(function(data) {
			expect(data).to.eql({
				id: 0,
				name: 'point 0'
			});
		});
	});

});


describe('Factory: GoogleMaps', function() {
	var GoogleMaps, google;

	beforeEach(function() {
		var mockGoogleMaps = {};
		window.angular.mock.module('SmartApp');
	});

	beforeEach(inject(function(_GoogleMaps_) {
		GoogleMaps = _GoogleMaps_;
	}));

	it('returns a map', function() {
		var map = GoogleMaps.createMap('div', {});
		expect(map).to.not.be.undefined;
	});

	it('returns a marker with color according to the sentiment', function() {
		var path_images = '/images/map_marker_colors/';
		var marker = GoogleMaps.createMarker({}, 4);
		expect(marker).to.not.be.undefined;
		expect(marker.icon).to.eql(path_images + 'green.png');
		marker = GoogleMaps.createMarker({}, 5);
		expect(marker.icon).to.eql(path_images + 'green.png');
		marker = GoogleMaps.createMarker({}, 3);
		expect(marker.icon).to.eql(path_images + 'lgreen.png');
		marker = GoogleMaps.createMarker({}, 2);
		expect(marker.icon).to.eql(path_images + 'yellow.png');
		marker = GoogleMaps.createMarker({}, 1);
		expect(marker.icon).to.eql(path_images + 'orange.png');
		marker = GoogleMaps.createMarker({}, 0);
		expect(marker.icon).to.eql(path_images + 'red.png');
		marker = GoogleMaps.createMarker({}, -1);
		expect(marker.icon).to.eql(path_images + 'red.png');
		marker = GoogleMaps.createMarker({}, 6);
		expect(marker.icon).to.eql(path_images + 'green.png');
	});

	it('returns a infoWindow', function() {
		var infoWindow = GoogleMaps.createInfoWindow();
		expect(infoWindow).to.not.be.undefined;
	});
});
