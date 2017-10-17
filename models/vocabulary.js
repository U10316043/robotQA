var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var vocabularySchema = new Schema({
  vocabularyTable: String,
  lessonNumTable: String,
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }
});

module.exports = mongoose.model('Vocabulary', vocabularySchema);