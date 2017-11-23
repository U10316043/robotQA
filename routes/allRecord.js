var express = require('express')
var async = require('async')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var lessonList = {}
var recordList = {}
var perLessonRecord = {}
// get all record
router.get('/allRecord', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.find(function (err, lesson) {
      if (err) {
        throw err
      } else {
        lessonList = lesson
      }
      res.render('userProfile', { lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
    })
  } else {
    res.render('error')
  }
})


router.get('/allRecord/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    async.auto({
      findlesson: function () {
        Lesson.find(function (err, lesson) {
          if (err) {
            throw err
          } else {
            lessonList = lesson
          }
        })
      },
      findAllRecord: function () {
        Record.findOne({'username': req.user.username}, function (err, recordResult) {
          if (err) {
            throw err
          } else if (!recordResult) {
            for (var i = 0; i < 10; i++) {
              console.log('uououououo')
            }
          } else {
            console.log('這裏：recordResult')
            console.log(recordResult)
            recordList = recordResult
          }
        })
      },
      findRecordId: function () {
        console.log('近來find Record Id!!!')
        Record.findOne({'username': req.user.username, 'lesson.lessonId': req.params.lessonId}, {'lesson.$': 1}, function (err, recordResult) {
          if (err) {
            console.log('!go to err!')
            throw err
          } else {
            if (!recordResult) {
              console.log('no recordResult')
              console.log()
              var testRecord = 0
              perLessonRecord = null
              testRecord = null
            } else {
              console.log('yes!!!!yes!!!')
              console.log(recordResult)
              perLessonRecord = recordResult// perLessonRecord：某一課程全記錄
              testRecord = (recordResult.lesson[0].testRecord).toString()// testRecord：某一課程所有考試成績
              console.log('perLessonRecord')
              console.log(perLessonRecord)
              console.log('testRecord')
              console.log(testRecord)
            }
            res.render('allRecord', { lessonId: req.params._id, recordInform: recordList, perLessonRecord: perLessonRecord, testRecord: testRecord, lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
          }
        })
      }
    })
  } else {
    res.render('error')
  }
})
module.exports = router
