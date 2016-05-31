/**
 * SentimentFeedback.js
 *
 * @description :: Model for feedback of the sentiment of tweets
 */

module.exports = {
  tableName: 'tweet_to_ip_feedback',
  meta: {
    schemaName: 'twitter'
  },
  autoUpdatedAt: false,
  attributes: {
    ip_id: {
      type: 'integer',
      primaryKey: true,
			unique: true,
      columnName: 'ip_id'
    },
    tweet_id: {
      type: 'integer',
      primaryKey: true,
			unique: true,
      columnName: 'twitter_id'
    },
    session_id: {
      type: 'string',
      primaryKey: true,
			unique: true,
      columnName: 'session_id'
    },
    feedback: {
      type: 'integer',
      columnName: 'feedback'
    },
    createdAt: {
      type: 'datetime',
      columnName: 'timestamp'
    }
  }
};
