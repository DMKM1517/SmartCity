/**
 * FeedbackController
 *
 * @description :: Server-side logic for managing Feedback
 */

module.exports = {
	add: function(req, res) {
		var ip = req.body.ip,
			tweet = req.body.tweet,
			value = req.body.value,
			session = req.sessionID;
		if (!ip || !tweet || !value || !session) {
			res.badRequest();
		} else {
			SentimentFeedbackService.addFeedback(ip, tweet, session, value, function(created) {
				if (created === true) {
					res.ok();
				} else {
					res.badRequest(created);
				}
			});
		}
	}
};
