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

SmartApp.directive('infowindow', function($templateRequest, $compile) {
	return {
		restrict: 'E',
		template: '<div>T</div>',
		link: function($scope, element) {
			console.log('link');
			$templateRequest('/templates/infowindow_cluster.html').then(function(template) {
				var content = $compile(template)($scope);
				console.log(content.html());
				element.append(content.html());
			});
		}
	};
});