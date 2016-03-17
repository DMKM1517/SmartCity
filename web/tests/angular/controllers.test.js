var EventEmitter = require('events').EventEmitter;

describe('Controller: MainCtrl', function() {
	var scope, PointsService, GoogleMaps;
	// test data
	var data = [{
		id: 0,
		name: 'point 0',
		latitude: 1,
		longitude: 1,
		sentiment: 1,
		email: 'email@email.com',
		address: 'address 0',
		phone: '123456789',
		web: 'www.web.com',
		facebook: 'facebook.com/point',
		schedule: '9:00 - 18:00'
	}, {
		id: 0,
		name: 'point 0',
		latitude: 1,
		longitude: 1,
		sentiment: 1,
		email: 'email@email.com',
		address: 'address 0',
		phone: '123456789',
		web: 'www.web.com',
		facebook: 'facebook.com/point',
		schedule: '9:00 - 18:00'
	}, {
		id: 1,
		name: 'point 1',
		latitude: 1,
		longitude: 1,
		sentiment: 1,
		email: 'email@email.com',
		address: 'address 1',
	}, {
		id: 2,
		name: 'point 2',
		latitude: 1,
		longitude: 1,
		sentiment: 1
	}, {
		id: 3,
		name: 'point 3',
		latitude: 1,
		longitude: 1,
		sentiment: 1,
		address: 'address 3'
	}];

	beforeEach(function() {
		var mockPointsService = {},
			mockGoogleMaps = {};
		window.angular.mock.module('SmartApp', function($provide) {
			$provide.value('PointsService', mockPointsService);
			$provide.value('GoogleMaps', mockGoogleMaps);
		});

		// inject PointsService
		inject(function($q) {
			mockPointsService.data = data;
			mockPointsService.getPoints = function(page) {
				var defer = $q.defer();
				if (page === 0) {
					defer.resolve(this.data.slice(0, 3));
				} else {
					defer.resolve(this.data.slice(3, this.data.length));
				}
				return defer.promise;
			};
		});

		// inject GoogleMaps
		inject(function() {
			mockGoogleMaps.map = {
				location: {
					lat: function() {
						return 1;
					},
					lng: function() {
						return 2;
					}
				},
				addListener: function(event, callback) {}
			};
			mockGoogleMaps.marker = {
				location: {
					lat: function() {
						return 1;
					},
					lng: function() {
						return 2;
					}
				},
				setMap: function(map) {},
				addListener: function(event, callback) {}
			};
			mockGoogleMaps.infoWindow = {
				content: '',
				setContent: function(content) {
					this.content = content;
				},
				open: function() {}
			};
			mockGoogleMaps.createMap = function(element, options) {
				return this.map;
			};
			mockGoogleMaps.createMarker = function(options, sentiment) {
				return this.marker;
			};
			mockGoogleMaps.createInfoWindow = function() {
				return this.infoWindow;
			};
		});
	});

	beforeEach(inject(function($controller, $rootScope, _GoogleMaps_, _PointsService_) {
		scope = $rootScope.$new();
		GoogleMaps = _GoogleMaps_;
		PointsService = _PointsService_;
		$controller('MainCtrl', {
			$scope: scope,
			GoogleMaps: GoogleMaps,
			PointsService: PointsService
		});
		scope.$digest();
	}));


	it('creates a google map', function() {
		expect(scope.map).to.not.be.undefined;
	});

	it('gets initial points', function() {
		expect(Object.keys(scope.points).length).to.be.above(1);
	});

	it('creates markers', function() {
		expect(Object.keys(scope.markers[0]).length).to.be.above(1);
	});

	it('does not create markers if they already exist', function() {
		expect(Object.keys(scope.markers[0]).length).to.eql(2);
	});

	it('gets more points and markers when zoomming in', function(done) {
		var emitter = new EventEmitter();
		expect(Object.keys(scope.points).length).to.eql(2);
		expect(Object.keys(scope.markers[0]).length).to.eql(2);
		emitter.on('zoom_changed', function(zoom) {
			scope.getPoints(zoom);
			scope.$apply();
			expect(Object.keys(scope.points).length).to.eql(4);
			expect(scope.markers.length).to.eql(2);
			expect(Object.keys(scope.markers[1]).length).to.eql(2);
			done();
		});
		emitter.emit('zoom_changed', 13);

	});

	it('does not get more points nor markers when zoomming out', function(done) {
		var emitter = new EventEmitter();
		expect(Object.keys(scope.points).length).to.eql(2);
		expect(Object.keys(scope.markers[0]).length).to.eql(2);
		emitter.on('zoom_changed', function(zoom) {
			scope.getPoints(zoom);
			scope.$apply();
			expect(Object.keys(scope.points).length).to.eql(2);
			expect(scope.markers.length).to.eql(1);
			expect(Object.keys(scope.markers[0]).length).to.eql(2);
			done();
		});
		emitter.emit('zoom_changed', 11);
	});

	it('opens an info window with only the information available when clicking a point', function() {
		scope.openInfoWindow(0, 0);
		var point = scope.points[0];
		expect(scope.infoWindow.content).to.equal(
			'<div style="max-width:400px">' +
			'<h4>' + point.name + '</h4>' +
			'<b>Email:</b> <a href="mailto:' + point.email + '">' + point.email + '</a><br>' +
			'<b>Address:</b> ' + point.address + '<br>' +
			'<b>Web:</b> <a href="' + point.web + '" target="_blank">' + point.web + '</a><br>' +
			'<b>Facebook:</b> ' + point.facebook + '<br>' +
			'<b>Phone:</b> ' + point.phone + '<br>' +
			'<b>Schedule:</b> ' + point.schedule +
			'</div>'
		);
		scope.openInfoWindow(0, 1);
		point = scope.points[1];
		expect(scope.infoWindow.content).to.equal(
			'<div style="max-width:400px">' +
			'<h4>' + point.name + '</h4>' +
			'<b>Email:</b> <a href="mailto:' + point.email + '">' + point.email + '</a><br>' +
			'<b>Address:</b> ' + point.address +
			'</div>'
		);
	});

});
