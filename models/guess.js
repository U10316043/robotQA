// 題目資料庫
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var guessSchema = new Schema({
  guessQ: String,
  guessA: String
})

module.exports = mongoose.model('Guess', guessSchema)
