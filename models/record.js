// 學生學習記錄資料庫
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var recordSchema = new Schema({
  username: String,
  lesson: [{
    lessonId: String,
    lessonFamilarity: Number, // 整個課程熟悉度
    testTimes: Number,
    wordFamiliarity: [], // 每個單字的熟悉程度
    testRecord: [] // 每次考試的分數
  }]
})

module.exports = mongoose.model('Record', recordSchema)
