module.exports = {
	addFeedback: function(ip_id, tweet_id, session_id, value, next) {
		SentimentFeedback.create({
			ip_id: ip_id,
			tweet_id: tweet_id,
			session_id: session_id,
			feedback: value
		}).exec(function(err, created) {
			if (err) {
				next(err);
			} else {
				next(true);
			}
		});
	}
};
