module.exports = {
	getTranslations: function(language, next) {
		Translations.find({
			language: language
		}, {
			select: ['key', 'translation']
		}).exec(function(err, translations) {
			if (err) throw err;
			next(translations);
		});
	}
};
