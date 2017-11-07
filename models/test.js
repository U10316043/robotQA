var mongoose = require('mongoose')
var Schema = mongoose.Schema
var testSchema = new Schema({
  username: String,
  lesson: [{
    word: String,
    score: Number
  }]
})

module.exports = mongoose.model('Test', testSchema)
