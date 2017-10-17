var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var vocabularySchema = new Schema({
  word: String,
  lessonId: String,
});

module.exports = mongoose.model('Vocabulary', vocabularySchema);