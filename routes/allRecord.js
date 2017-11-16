var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var examResult = require('./exam')
// get all record
router.get('/allRecord', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    res.render('allRecord', { user: req.user, loginStatus: req.isAuthenticated() })
  } else {
    res.render('error')
  }
})
module.exports = router
