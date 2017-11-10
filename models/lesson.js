// 題目資料庫
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var lessonSchema = new Schema({
  num: String,
  name: String,
  info: String,
  vocabulary: [{
    word: String
  }]
})

module.exports = mongoose.model('Lesson', lessonSchema)
