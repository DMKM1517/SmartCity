/**
 * Points.js
 *
 * @description :: Model for interest points. It reads from an aggregated view.
 */

module.exports = {
  tableName: 'translations',
  meta: {
    schemaName: 'web'
  },
  attributes: {
    key: {
      type: 'string',
      primaryKey: true,
      columnName: 'key'
    },
    language: {
      type: 'string',
      primaryKey: true,
      columnName: 'language'
    },
    translation: {
      type: 'string',
      columnName: 'translation'
    }
  }
};
