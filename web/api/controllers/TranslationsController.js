/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 */

module.exports = {
	getTranslations: function(req, res) {
		var language = req.query.lang || 'en';
		TranslationsService.getTranslations(language, function(rows) {
			var translations = {};
			for (var i in rows) {
				translations[rows[i].key] = rows[i].translation;
			}
			res.json(translations);
		});
	}
};
