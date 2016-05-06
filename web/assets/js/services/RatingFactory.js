SmartApp.factory('RatingFactory', ['colorsCnst', function(colorsCnst) {
	return {
		getRatingsAndClass: function(rating_full) {
			var rating = rating_full.toFixed(1);
			if (rating > 5) {
				rating = '5.0';
			}
			if (rating < 0) {
				rating = '0.0';
			}
			var tmp_rating = Math.floor(rating);
			var rating2 = (Math.floor(rating * 2) / 2).toFixed(1);
			var star_class = 'star_';
			if (tmp_rating >= 5) {
				tmp_rating = 4;
			}
			star_class += colorsCnst[tmp_rating];
			return { rating1: rating, rating2: rating2, star_class: star_class };
		}
	};
}]);