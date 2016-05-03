SmartApp.directive('menubar', function() {
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		// restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		restrict: 'E',
		// template: '',
		templateUrl: '/templates/menubar.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		// link: function($scope, iElm, iAttrs, controller) {
		// 	
		// }
	};
});

SmartApp.directive('cont', function() {
	return function(scope, element, attrs) {
		var changeHeight = function() {
			var offset = 52;
			if (attrs.class && attrs.class.split(' ').indexOf('subcont') !== -1) {
				element.css('height', '300px');
				setTimeout(function() {
					offset += $('#point_title').height();
					element.css('height', (window.innerHeight - offset) + 'px');
				}, 1000);
			} else {
				element.css('height', (window.innerHeight - offset) + 'px');
			}
		};
		$(window).resize(function() {
			changeHeight();
		});
		changeHeight();
	};
});
