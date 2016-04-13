/**
 * Points.js
 *
 * @description :: Model for interest points. It reads from an aggregated view.
 */

module.exports = {
  tableName: 'translation_keys',
  meta: {
    schemaName: 'web'
  },
  attributes: {
    key: {
      type: 'string',
      unique: true,
      primaryKey: true,
      columnName: 'key'
    },
    namespace: {
      type: 'string',
      columnName: 'namespace'
    }
  }
};
