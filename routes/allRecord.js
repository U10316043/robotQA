var express = require('express')
var async = require('async')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var lessonList = {}
var recordList = {}
var perLessonRecord = {}

// userProfile
router.get('/allRecord', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    async.auto({
      fun1: function (finish) {
        Lesson.find(function (err, lesson) {
          if (err) {
            throw err
          } else {
            lessonList = lesson
            console.log('lessonlist!!!!!!!')
            console.log(lessonList)
            console.log('lessonlist!!!!!!!')
          }
        })
        finish(null)   // 會傳到 results
      },
      fun2: ['fun1', function (results, finish) {
        Record.find({'username': req.user.username}, function (err, recordResult) {
          if (err) {
            throw err
          } else if (!recordResult) {
            console.log('不存在此人的記錄')
          } else {
            console.log('這個user的記錄：recordResult')
            console.log(recordResult)
            recordList = recordResult
            console.log('recordList')
            console.log(recordList)
            res.render('userProfile', { recordInform: recordList, lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
          }
        })
        finish(null)
      }],
      fun3: ['fun1', 'fun2', function (results, finish) {
        finish(null)
        
      }]

    }, function (err, results) {
      if (err) console.log(err)
      console.log(results)
    })
  } else {
    res.render('error')
  }
})

// get all record
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
