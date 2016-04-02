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

	describe('getPoints()', function() {

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
	});

	describe('getPoint()', function() {

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

		it('returns an error if not found', function() {
			httpBackend.whenGET('/points/10').respond(404, 'Not found');
			PointsService.getPoint(10).then(function(data) {
				expect(data).to.be.undefined;
			}, function(resp) {
				expect(resp).to.eql('Not found');
			});
			httpBackend.flush();
		});

	});

});


describe('Factory: GoogleMaps', function() {
	var GoogleMaps, google, colorsCnst;

	beforeEach(function() {
		var mockGoogleMaps = {};
		window.angular.mock.module('SmartApp');
	});

	beforeEach(inject(function(_GoogleMaps_, _colorsCnst_) {
		GoogleMaps = _GoogleMaps_;
		colorsCnst = _colorsCnst_;
	}));

	it('returns a map', function() {
		var map = GoogleMaps.createMap('div', {});
		expect(map).to.not.be.undefined;
	});

	it('returns a marker with color according to the sentiment', function() {
		var path_images = '/images/map_marker_colors/';
		var marker = GoogleMaps.createMarker({}, 4);
		expect(marker).to.not.be.undefined;
		expect(marker.icon).to.eql(path_images + colorsCnst[4] + '.png');
		marker = GoogleMaps.createMarker({}, 5);
		expect(marker.icon).to.eql(path_images + colorsCnst[4] + '.png');
		marker = GoogleMaps.createMarker({}, 3);
		expect(marker.icon).to.eql(path_images + colorsCnst[3] + '.png');
		marker = GoogleMaps.createMarker({}, 2);
		expect(marker.icon).to.eql(path_images + colorsCnst[2] + '.png');
		marker = GoogleMaps.createMarker({}, 1);
		expect(marker.icon).to.eql(path_images + colorsCnst[1] + '.png');
		marker = GoogleMaps.createMarker({}, 0);
		expect(marker.icon).to.eql(path_images + colorsCnst[0] + '.png');
		marker = GoogleMaps.createMarker({}, -1);
		expect(marker.icon).to.eql(path_images + colorsCnst[0] + '.png');
		marker = GoogleMaps.createMarker({}, 6);
		expect(marker.icon).to.eql(path_images + colorsCnst[4] + '.png');
	});

	it('returns a infoWindow', function() {
		var infoWindow = GoogleMaps.createInfoWindow();
		expect(infoWindow).to.not.be.undefined;
	});
});

describe('Factory: RatingFactory', function() {
	var RatingFactory, colorsCnst;

	beforeEach(function() {
		// main module app
		window.angular.mock.module('SmartApp');
	});

	beforeEach(inject(function(_RatingFactory_, _colorsCnst_) {
		RatingFactory = _RatingFactory_;
		colorsCnst = _colorsCnst_;
	}));

	it('returns an object with rating1 with 1 decimal', function() {
		var RF = RatingFactory.getRatingsAndClass(4.35);
		expect(RF.rating1).to.eql('4.3');
		RF = RatingFactory.getRatingsAndClass(5.35);
		expect(RF.rating1).to.eql('5.0');
		RF = RatingFactory.getRatingsAndClass(-0.35);
		expect(RF.rating1).to.eql('0.0');
	});

	it('returns an object with rating2 with .0 or .5', function() {
		var RF = RatingFactory.getRatingsAndClass(4.35);
		expect(RF.rating2).to.eql('4.0');
		RF = RatingFactory.getRatingsAndClass(4.65);
		expect(RF.rating2).to.eql('4.5');
		RF = RatingFactory.getRatingsAndClass(5.35);
		expect(RF.rating2).to.eql('5.0');
		RF = RatingFactory.getRatingsAndClass(-0.35);
		expect(RF.rating2).to.eql('0.0');
	});

	it('returns an object with the star class', function() {
		var RF = RatingFactory.getRatingsAndClass(4.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[4]);
		RF = RatingFactory.getRatingsAndClass(5.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[4]);
		RF = RatingFactory.getRatingsAndClass(3.65);
		expect(RF.star_class).to.eql('star_' + colorsCnst[3]);
		RF = RatingFactory.getRatingsAndClass(2.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[2]);
		RF = RatingFactory.getRatingsAndClass(1.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[1]);
		RF = RatingFactory.getRatingsAndClass(0.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[0]);
		RF = RatingFactory.getRatingsAndClass(-0.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[0]);
		RF = RatingFactory.getRatingsAndClass(6.35);
		expect(RF.star_class).to.eql('star_' + colorsCnst[4]);
	});
});
