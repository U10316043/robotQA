// 學生學習記錄資料庫
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var recordSchema = new Schema({
  username: String,
  lesson: [{
    lessonId: String, // 測驗的課程ID
    lessonNum: String,
    lessonName: String,
    isActive: { type: Boolean, default: true },
    lessonTotalScore: Number, // 整個課程的綜合成績
    testTimes: Number, // 測驗次數
    wordTotalScore: [], // 每次測驗的單字得分加總
    testRecord: [] // 每次考試的分數
  }]
})

module.exports = mongoose.model('Record', recordSchema)
