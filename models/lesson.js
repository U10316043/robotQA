var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lessonSchema = new Schema({
  lessonNumTable: String,
  lessonNameTable: String,
  lessonInformationTable:  String,
});

module.exports = mongoose.model('Lesson', lessonSchema);