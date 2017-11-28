var express = require('express')
var async = require('async')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')

var recordList = {}
var perLessonRecord = {}

var noActive = []
var noTest = []
var hasRecord = []
// userProfile
router.get('/allRecord', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Record.find({ 'username': req.user.username }, function (err, recordResult) {
      if (err) {
        throw err
      } else if (!recordResult) {
        console.log('不存在此人的記錄')
      } else {
        var noActive = []
        var noTest = []
        var hasRecord = []
        var noActiveIndex = 0
        var noTestIndex = 0
        var hasRecordIndex = 0
        for (var i = 0; i < recordResult[0].lesson.length; i++) {
          console.log(i + ':  ' + recordResult[0].lesson)
          if (recordResult[0].lesson[i].isActive === false) {
            noActive[noActiveIndex] = recordResult[0].lesson[i]
            noActiveIndex++
          } else if (recordResult[0].lesson[i].testTimes === 0) {
            noTest[noTestIndex] = recordResult[0].lesson[i]
            noTestIndex++
          } else {
            hasRecord[hasRecordIndex] = recordResult[0].lesson[i]
            hasRecordIndex++
          }
        }

        // res.render('error')
        res.render('userProfile', { noActive: noActive, noTest: noTest, hasRecord: hasRecord, user: req.user })
      }
    })
  } else {
    res.render('error')
  }
})

// get all record
router.get('/allRecord/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    async.auto({
      findSidebar: function () {
        Record.find({ 'username': req.user.username }, function (err, recordResult) {
          if (err) {
            throw err
          } else if (!recordResult) {
            console.log('不存在此人的記錄')
          } else {
            recordList = recordResult
            noActive = []
            noTest = []
            hasRecord = []
            var noActiveIndex = 0
            var noTestIndex = 0
            var hasRecordIndex = 0
            for (var i = 0; i < recordResult[0].lesson.length; i++) {
              console.log(i + ':  ' + recordResult[0].lesson)
              if (recordResult[0].lesson[i].isActive === false) {
                noActive[noActiveIndex] = recordResult[0].lesson[i]
                noActiveIndex++
              } else if (recordResult[0].lesson[i].testTimes === 0) {
                noTest[noTestIndex] = recordResult[0].lesson[i]
                noTestIndex++
              } else {
                hasRecord[hasRecordIndex] = recordResult[0].lesson[i]
                hasRecordIndex++
              }
            }
    
            // res.render('error')
          }
        })
      },
      findRecordId: function () {
        Record.findOne({'username': req.user.username, 'lesson.lessonId': req.params.lessonId}, {'lesson.$': 1}, function (err, recordResult) {
          if (err) {
            throw err
          } else {
            if (!recordResult) {
              console.log('no!!!!n!!!')
              console.log('no recordResult')
            } else {
              console.log('yes!!!!yes!!!')
              console.log(recordResult)
              perLessonRecord = recordResult// perLessonRecord：某一課程全記錄
              if (recordResult.lesson[0].testTimes === 0) {
                var testRecord = '0'
              } else {
                testRecord = (recordResult.lesson[0].testRecord).toString()// testRecord：某一課程所有考試成績
              }
            }
            res.render('allRecord', { recordInform: recordList, lessonId: req.params._id, noActive: noActive, noTest: noTest, hasRecord: hasRecord, perLessonRecord: perLessonRecord, testRecord: testRecord, user: req.user })
          }
        })
      }
    })
  } else {
    res.render('error')
  }
})
module.exports = router
