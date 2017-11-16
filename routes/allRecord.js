var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var lessonList = {}
// get all record
router.get('/allRecord', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.find(function (err, lesson) {
      if (err) {
        throw err
      } else {
        lessonList = lesson
      }
      res.render('allRecord', { lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
    })
  } else {
    res.render('error')
  }
})
module.exports = router
