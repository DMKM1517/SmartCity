describe('MainCtrl', function() {
  var scope, PointsService, GoogleMaps;

  beforeEach(function() {
    var mockPointsService = {},
      mockGoogleMaps = {};
    module('SmartApp', function($provide) {
      $provide.value('PointsService', mockPointsService);
      $provide.value('GoogleMaps', mockGoogleMaps);
    });

    inject(function($q) {
      mockPointsService.data = [{
        id: 0,
        name: 'point 0',
        latitude: 1,
        longitude: 1,
        sentiment: 1
      }, {
        id: 0,
        name: 'point 0',
        latitude: 1,
        longitude: 1,
        sentiment: 1
      }, {
        id: 1,
        name: 'point 1',
        latitude: 1,
        longitude: 1,
        sentiment: 1
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
        sentiment: 1
      }];
      mockPointsService.getPoints = function(page) {
        var defer = $q.defer();
        if (page == 0) {
          defer.resolve(this.data.slice(0, 3));
        } else {
          defer.resolve(this.data.slice(3, this.data.length));
        }
        return defer.promise;
      };
    });

    inject(function() {
      mockGoogleMaps.map = {
        data: {
          location: {
            lat: function() {
              return 1;
            },
            lng: function() {
              return 2;
            }
          }
        },
        addListener: function(event, callback) {}
      };
      mockGoogleMaps.marker = {
        data: {
          location: {
            lat: function() {
              return 1;
            },
            lng: function() {
              return 2;
            }
          }
        },
        setMap: function(map) {}
      }
      mockGoogleMaps.createMap = function(element, options) {
        return this.map;
      };
      mockGoogleMaps.createMarker = function(options) {
        return this.marker;
      };
    })
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
    expect(scope.map).toBeDefined();
  });

  it('gets initial points', function() {
    expect(Object.keys(scope.points).length).not.toBeLessThan(1);
  });

  it('creates markers', function() {
    expect(Object.keys(scope.markers[0]).length).not.toBeLessThan(1);
  });

  it('does not create markers if they already exist', function() {
    expect(Object.keys(scope.markers[0]).length).toEqual(2);
  });

  it('gets more points and markers when zoomming in', function() {
    expect(Object.keys(scope.points).length).toEqual(2);
    expect(Object.keys(scope.markers[0]).length).toEqual(2);
    scope.getPoints(13);
    scope.$apply();
    expect(Object.keys(scope.points).length).toEqual(4);
    expect(scope.markers.length).toEqual(2);
    expect(Object.keys(scope.markers[1]).length).toEqual(2);
  });

  it('does not get more points nor markers when zoomming out', function() {
    expect(Object.keys(scope.points).length).toEqual(2);
    expect(Object.keys(scope.markers[0]).length).toEqual(2);
    scope.getPoints(11);
    scope.$apply();
    expect(Object.keys(scope.points).length).toEqual(2);
    expect(scope.markers.length).toEqual(1);
    expect(Object.keys(scope.markers[0]).length).toEqual(2);
  });

});
