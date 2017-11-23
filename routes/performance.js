var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var examResult = require('./exam.js')

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
        console.log('numlist' + examResult.numlist)
        res.render('error')
      }
    })
  } else {
    res.render('error')
  }
})

module.exports = router
