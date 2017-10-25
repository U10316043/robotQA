var mongoose = require('mongoose')
var Schema = mongoose.Schema
var lessonSchema = new Schema({
  num: String,
  name: String,
  info: String,
  vocabulary: [{
    word: String
  }],
  totalExam: Number,
  totalCorrect: Number
})

module.exports = mongoose.model('Lesson', lessonSchema)
