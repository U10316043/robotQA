var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')

// get課程列表
var lessonList = {}
router.get('/insertLesson', function (req, res, next) {
  Lesson.find(function (err, lesson) {
    if (err) {
      throw err
    } else {
      lessonList = lesson
    }
    res.render('insertLesson',
      {
        lessoninform: lessonList,
        user: req.user,
        loginStatus: req.isAuthenticated()
      }
    )
  })
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
  })
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
    {lesson: {$elemMatch: {lessonId: req.params.lesson_id, testTimes: {$ne: 0}}}},
    {$set: {
      'lesson.$.isActive': false
    }},
    {multi: true},
    function (err) {
      if (err) {
        throw err
      }
    }
  )
  Record.update(
    {lesson: {$elemMatch: {lessonId: req.params.lesson_id, testTimes: 0}}},
    {$pull: {
      lesson: {lessonId: req.params.lesson_id}
    }},
    {multi: true},
    function (err) {
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
  Record.update(
    {lesson: {$elemMatch: {lessonId: req.params.lesson_id}}},
    {$set: {
      'lesson.$.lessonNum': req.body.lessonNum,
      'lesson.$.lessonName': req.body.lessonName
    }},
    {multi: true},
    function (err) {
      if (err) {
        throw err
      }
    }
  )
  res.redirect('/insertLesson')
})

module.exports = router
