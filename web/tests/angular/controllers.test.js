var EventEmitter = require('events').EventEmitter;
// test data
var data = [{
	id: 0,
	name: 'point 0',
	category: 'category 1',
	latitude: 1,
	longitude: 1,
	rating: 1,
	email: 'email@email.com',
	address: 'address 0',
	phone: '123456789',
	web: 'www.web.com',
	facebook: 'facebook.com/point',
	schedule: '9:00 - 18:00'
}, {
	id: 0,
	name: 'point 0',
	category: 'category 1',
	latitude: 1,
	longitude: 1,
	rating: 1,
	email: 'email@email.com',
	address: 'address 0',
	phone: '123456789',
	web: 'www.web.com',
	facebook: 'facebook.com/point',
	schedule: '9:00 - 18:00'
}, {
	id: 1,
	name: 'point 1',
	category: 'category 1',
	latitude: 1,
	longitude: 1,
	rating: 1,
	address: 'address 1'
}, {
	id: 2,
	name: 'point 2',
	category: 'category 1',
	latitude: 1,
	longitude: 1,
	rating: 1,
	web: 'www.web.com;www.web.com'
}, {
	id: 3,
	name: 'point 3',
	category: 'category 2',
	latitude: 1,
	longitude: 1,
	rating: 1,
	address: 'address 3'
}];

describe('Controller: MainCtrl', function() {
	var rootScope, scope, $location, PointsService, GoogleMaps;

	// inject app, templates, services
	beforeEach(function() {
		var mockPointsService = {};
		window.angular.mock.module('SmartApp', function($provide) {
			$provide.value('PointsService', mockPointsService);
		});

		// templates html
		window.angular.mock.module('templates');
		$('body').append('<div id="map"></div>');

		// inject PointsService
		inject(function($q) {
			mockPointsService.data = data;
			mockPointsService.getPoints = function(page) {
				var defer = $q.defer();
				if (page === 0) {
					defer.resolve(this.data.slice(1, 3));
				} else {
					defer.resolve(this.data.slice(1, this.data.length));
				}
				return defer.promise;
			};
			mockPointsService.getPoint = function(id) {
				var defer = $q.defer();
				var point = data[id+1];
				if (point) {
					defer.resolve(point);
				} else {
					defer.reject('no point');
				}
				return defer.promise;
			};
			mockPointsService.getCategories = function() {
				var defer = $q.defer();
				defer.resolve([
					{ category: 'category 1', count: 4 },
					{ category: 'category 2', count: 1 }
				]);
				return defer.promise;
			};
			mockPointsService.filterCategories = function(selected_categories) {
				var filtered = [];
				for (var i in data) {
					var point = data[i];
					if (selected_categories[point.category]) {
						filtered.push(point.id);
					}
				}
				return filtered;
			};
		});

	});

	// initialize variables and scope
	beforeEach(inject(function($controller, $rootScope, _$location_, _GoogleMaps_, _PointsService_) {
		rootScope = $rootScope;
		scope = $rootScope.$new();
		$location = _$location_;
		GoogleMaps = _GoogleMaps_;
		PointsService = _PointsService_;
		$controller('MainCtrl', {
			$scope: scope,
			$location: $location,
			GoogleMaps: GoogleMaps,
			PointsService: PointsService
		});
		scope.$digest();
	}));


	it('creates a google map', function() {
		expect(scope.map).to.not.be.undefined;
	});

	it('gets initial points and create markers', function() {
		expect(Object.keys(scope.markers).length).to.be.above(0);
	});

	it('does not create markers if they already exist', function() {
		expect(Object.keys(scope.markers).length).to.eql(2);
	});

	it('gets more points and markers when zoomming in', function(done) {
		var emitter = new EventEmitter();
		expect(Object.keys(scope.markers).length).to.eql(2);
		emitter.on('zoom_changed', function(zoom) {
			scope.getPoints(zoom);
			scope.$apply();
			expect(Object.keys(scope.markers).length).to.eql(4);
			done();
		});
		emitter.emit('zoom_changed', 13);

	});

	it('does not get more points nor markers when zoomming out', function(done) {
		var emitter = new EventEmitter();
		expect(Object.keys(scope.markers).length).to.eql(2);
		emitter.on('zoom_changed', function(zoom) {
			scope.getPoints(zoom);
			scope.$apply();
			expect(Object.keys(scope.markers).length).to.eql(2);
			done();
		});
		emitter.emit('zoom_changed', 11);
	});

	it('toggles the menu', function() {
		$('body').append('<div id="toggle"></div>');
		scope.toggleMenu();
		expect($('#toggle')).to.have.class('on');
		scope.toggleMenu();
		expect($('#toggle')).to.not.have.class('on');
	});


	describe('info window', function() {
		var header = '<div class="info_window">' +
			'<div class="row">' +
			'<div class="col-xs-9">';
		var header2 = '</div>' +
			'<div class="col-xs-3">' +
			'<div class="stars pull-right star_orange">' +
			'<input type="hidden" class="rating" data-fractions="2" value="1.0" data-readonly/>' +
			'</div>' +
			'<div class="rating_number">' +
			'1.0' +
			'</div>' +
			'</div>' +
			'</div>';

		describe('when clicking a point', function() {

			it('displays only address, web and schedule if available', function() {
				scope.openInfoWindow(0);
				scope.$digest();
				var point = data[1];
				expect(scope.infoWindow.content).to.equal(
					header +
					'<h4>' + point.name + '</h4>' +
					'<div class="category">' + point.category + '</div>' +
					header2 +
					'<b>Address:</b> ' + point.address + '<br>' +
					'<b>Web:</b> <a href="www.web.com" target="_blank">www.web.com</a><br>' +
					'<b>Schedule:</b> ' + point.schedule +
					'<div class="row">' +
					'<div class="col-xs-9">' +
					'</div>' +
					'<div class="col-xs-3">' +
					'<a href="#/point/' + point.id + '?z=' + scope.map.getZoom() + '">More information</a>' +
					'</div>' +
					'</div>' +
					'</div>'
				);
				scope.openInfoWindow(1);
				scope.$digest();
				point = data[2];
				expect(scope.infoWindow.content).to.equal(
					header +
					'<h4>' + point.name + '</h4>' +
					'<div class="category">' + point.category + '</div>' +
					header2 +
					'<b>Address:</b> ' + point.address +
					'<div class="row">' +
					'<div class="col-xs-9">' +
					'</div>' +
					'<div class="col-xs-3">' +
					'<a href="#/point/' + point.id + '?z=' + scope.map.getZoom() + '">More information</a>' +
					'</div>' +
					'</div>' +
					'</div>'
				);
			});

			it('displays in different lines when more than one web link', function() {
				scope.getPoints(13);
				scope.$digest();
				scope.openInfoWindow(2);
				scope.$digest();
				var point = data[3];
				expect(scope.infoWindow.content).to.equal(
					header +
					'<h4>' + point.name + '</h4>' +
					'<div class="category">' + point.category + '</div>' +
					header2 +
					'<b>Web:</b> <a href="www.web.com" target="_blank">www.web.com</a><br>' +
					'<a href="www.web.com" target="_blank">www.web.com</a>' +
					'<div class="row">' +
					'<div class="col-xs-9">' +
					'</div>' +
					'<div class="col-xs-3">' +
					'<a href="#/point/' + point.id + '?z=' + scope.map.getZoom() + '">More information</a>' +
					'</div>' +
					'</div>' +
					'</div>'
				);
			});

		});

		describe('with parameters passed', function() {

			it('opens the info window of the id passed', function() {
				$location.search({ id: 0, z: 12 });
				scope.$digest();
				var point = data[1];
				expect(scope.infoWindow.content).to.contain(point.name);
				$location.search({ id: 3, z: 13 });
				scope.$digest();
				point = data[4];
				expect(scope.infoWindow.content).to.contain(point.name);
			});

			it('clears the location.search if point not found', function() {
				$location.search({ id: 10, z: 12 });
				scope.$digest();
				expect($location.search()).to.eql({});
			});
		});

	});


	describe('filtering', function() {

		it('shows only the markers filtered', function() {
			rootScope.selected_categories['category 1'] = false;
			scope.filter();
			expect(scope.markers_clusters.getTotalMarkers()).to.eql(0);
			scope.getPoints(13);
			scope.$digest();
			expect(scope.markers_clusters.getTotalMarkers()).to.eql(1);
		});

		it('allows to select all or none', function() {
			var i;
			scope.selectAll(false);
			for (i in scope.selected_categories) {
				expect(scope.selected_categories[i]).to.eql(false);
			}
			scope.selectAll(true);
			for (i in scope.selected_categories) {
				expect(scope.selected_categories[i]).to.eql(true);
			}
		});
	});

});

describe('Controller: PointCtrl', function() {
	var rootScope, scope, routeParams, PointsService, location;

	// inject app, templates, services
	beforeEach(function() {
		var mockPointsService = {};
		window.angular.mock.module('SmartApp', function($provide) {
			$provide.value('PointsService', mockPointsService);
		});

		// templates html
		window.angular.mock.module('templates');

		// inject PointsService
		inject(function($q) {
			mockPointsService.data = data;
			mockPointsService.getPoints = function(page) {
				var defer = $q.defer();
				if (page === 0) {
					defer.resolve(this.data.slice(1, 3));
				} else {
					defer.resolve(this.data.slice(1, this.data.length));
				}
				return defer.promise;
			};
			mockPointsService.getPoint = function(id) {
				var defer = $q.defer();
				var point = data[id];
				if (point) {
					defer.resolve(point);
				} else {
					defer.reject('no point');
				}
				return defer.promise;
			};
		});

	});

	// initialize variables and scope
	beforeEach(inject(function($controller, $rootScope, _$routeParams_, _PointsService_, $location) {
		rootScope = $rootScope;
		scope = $rootScope.$new();
		routeParams = _$routeParams_;
		routeParams.id = 0;
		PointsService = _PointsService_;
		location = $location;
		location.path('/point/0');
		$controller('PointCtrl', {
			$scope: scope,
			$routeParams: routeParams
		});
		scope.$digest();
	}));


	it('gets the information of a point', function() {
		expect(scope.point).to.not.be.undefined;
	});

	it('redirects to home with the id and zoom', function() {
		var spy_path = chai.spy.on(location, 'path');
		var spy_search = chai.spy.on(location, 'search');
		scope.back();
		scope.$apply();
		expect(spy_path).to.have.been.called.with('/');
		expect(spy_search).to.have.been.called.with({ id: 0, z: 12 });
	});

	describe('with non-existing id', function() {
		beforeEach(inject(function($controller, $rootScope, _$routeParams_, _PointsService_, $location) {
			rootScope = $rootScope;
			scope = $rootScope.$new();
			routeParams = _$routeParams_;
			routeParams.id = 10;
			PointsService = _PointsService_;
			location = $location;
			location.path('/point/10');
			$controller('PointCtrl', {
				$scope: scope,
				$routeParams: routeParams
			});
			scope.$digest();
		}));

		it('handles point not found', function() {
			expect(scope.point).to.not.be.undefined;
			expect(scope.point.name).to.eql('Point not found');
		});
	});
});
