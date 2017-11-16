var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')

// get課程列表
var lessonlist = {}
router.get('/insertLesson', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.find(function (err, result) {
      if (err) {
        throw err
      } else {
        lessonlist = result
      }
      res.render('insertLesson', { lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
    })
  } else {
    res.render('error')
  }
})

// POST新增課程
router.post('/addlesson', function (req, res) {
  var newLesson = new Lesson()
  newLesson.num = req.body.lessonNum
  newLesson.name = req.body.lessonName
  newLesson.info = req.body.lessonInformation
  newLesson.save(function (err) {
    if (err) {
      throw err
    }
      // return done(null); //Error: Can't set headers after they are sent. sent response end twice
  })
  // if (!req.body) return res.sendStatus(400)
  res.redirect('/insertLesson')
})

// 刪除課程
router.get('/deletecourse/:lesson_id', function (req, res) {
  Lesson.findByIdAndRemove(req.params.lesson_id, function (err) {
    if (err) {
      throw err
    }
  })
  Record.update(
    { },
    { $pull: { lesson: {lessonId: req.params.lesson_id} } },
    { multi: true },
    function (err, result) {
      if (err) {
        throw err
      }
    }
  )
  res.redirect('/insertLesson')
})
// 修改課程資訊
router.post('/editcourse/:lesson_id', function (req, res) {
  console.log(req.params.lesson_id)
  console.log(req.body.lessonNum + '  ' + req.body.lessonName)
  Lesson.findOneAndUpdate(
    {'_id': req.params.lesson_id},
    {$set: {
      'num': req.body.lessonNum,
      'name': req.body.lessonName,
      'info': req.body.lessonInformation
    }},
    function (err, result) {
      if (err) {
        throw err
      }
    }
  )
  res.redirect('/insertLesson')
})

module.exports = router
