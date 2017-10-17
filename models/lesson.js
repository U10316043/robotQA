var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lessonSchema = new Schema({
  num: String,
  name: String,
  info:  String,
});

module.exports = mongoose.model('Lesson', lessonSchema);