SmartApp.directive('menubar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/menubar.html',
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
