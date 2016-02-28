var SmartApp = angular.module('SmartApp', ['ngRoute', 'SmartControllers']);

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