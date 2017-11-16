var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var examResult = require('./exam.js')
var wordlist = require('./exam.js').wordlist

var lessonlist = {}
// get performance 測驗成績
router.get('/performance/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
      if (err) {
        throw err
      } else {
        lessonlist = lessondb
        console.log(lessonlist)
        console.log(examResult)
        console.log('wordlist: ' + wordlist.wordlist)
        console.log('testResult: ' + examResult.testResult)
        console.log('numlist: ' + examResult.numlist)
        console.log('everyScoreNum: ' + examResult.everyScoreNum)
        res.render('performance')
      }
    })
  } else {
    res.render('error')
  }
})

module.exports = router
