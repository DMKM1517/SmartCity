var SmartApp = angular.module('SmartApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.tpls', 'angular-loading-bar']);

SmartApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/', {
			templateUrl: '/templates/home.html',
			controller: 'MainCtrl'
		}).when('/point/:id', {
			templateUrl: '/templates/point.html',
			controller: 'PointCtrl'
		}).otherwise({
			redirectTo: '/'
		});
	}
]);

SmartApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.parentSelector = '#loader';
	cfpLoadingBarProvider.spinnerTemplate = '<div>loading...</div>';
}]);