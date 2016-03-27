var SmartApp = angular.module('SmartApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.tpls']);

SmartApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/', {
			templateUrl: '/templates/home.html',
			controller: 'MainCtrl'
		}).otherwise({
			redirectTo: '/'
		});
	}
]);