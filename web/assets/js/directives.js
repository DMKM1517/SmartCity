SmartApp.directive('menubar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/menubar.html',
	};
});

SmartApp.directive('cont', function() {
	return function(scope, element, attrs) {
		function changeHeight() {
			var offset_height = 52,
				offset_width = 280;
			if (attrs.id) {
				// map
				if (attrs.id == 'cont_map') {
					element.css('height', (window.innerHeight - offset_height) + 'px');
				}
				// twitter
				else if (attrs.id == 'cont_twitter') {
					offset_height += 45;
					$('.twitter-timeline').attr('height', (window.innerHeight - offset_height) + 'px');
					element.find('iframe').css('height', (window.innerHeight - offset_height) + 'px');
				}
				// menu
				else if (attrs.id == 'menu') {
					element.css('height', (window.innerHeight - offset_height) + 'px');
				}
				// subcont
				else if (attrs.id == 'subcont') {
					element.css('height', '300px');
					setTimeout(function() {
						offset_height += $('#point_title').height();
						element.css('height', (window.innerHeight - offset_height) + 'px');
					}, 1100);
				}
			} else {
				element.css('height', (window.innerHeight - offset_height) + 'px');
			}
		}
		$(window).resize(function() {
			changeHeight();
		});
		changeHeight();
	};
});
