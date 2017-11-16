var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var examResult = require('./exam.js')
var wordList = require('./exam.js').wordList

var lessonList = {}
// get performance 測驗成績
router.get('/performance/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lesson) {
      if (err) {
        throw err
      } else {
        lessonList = lesson
        console.log(lessonList)
        console.log(examResult)
        console.log('wordList: ' + wordList.wordList)
        console.log('testResult: ' + examResult.testResult)
        console.log('numList: ' + examResult.numList)
        console.log('everyScoreNum: ' + examResult.everyScoreNum)
        res.render('performance')
      }
    })
  } else {
    res.render('error')
  }
})

module.exports = router
