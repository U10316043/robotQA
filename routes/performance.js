var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')

// get performance
router.get('/performance', function (req, res, next) {
  res.render('performance', { user: req.user, loginStatus: req.isAuthenticated() })
})

// get單字列表
var lessonlist = {}
router.get('/performance/:lessonId', function (req, res, next) {
  Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
    if (err) {
      throw err
    } else {
      lessonlist = lessondb
      res.render('performance', { lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
    }
  })
})

module.exports = router
