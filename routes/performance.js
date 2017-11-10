var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var examResult = require('./exam')

// 接收成績
var testResult = [] // 每個答案的得分(按照題目順序)
var testResultOrder = [] // 每個答案的得分(按照資料庫中字母順序)
var totalResult // 每個答案加起來總得分
var numlist = examResult.numlist // 出題單字排序
router.post('/1/perlessonScore', function (req, res) {
  testResult = req.query.testResult
  totalResult = 0
  res.send({status: 'success', testResult: testResult})
  for (var i = 0; i < numlist.length; i++) {
    testResultOrder[numlist[i]] = testResult[i]
    totalResult = totalResult + parseInt(testResult[i])
  }
})

var lessonlist = {}
var wordlist = []
// get performance 測驗成績
router.get('/performance/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
      if (err) {
        throw err
      } else {
        lessonlist = lessondb
        for (var i = 0; i < numlist.length; i++) {
          wordlist[i] = lessonlist.vocabulary[numlist[i]].word
        }
        res.render('performance', { numlist: numlist, testResult: testResult, lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
      }
    })
  } else {
    res.render('error')
  }
})

// post 儲存學習記錄
router.post('/record/:lessonId', function (req, res) {
  if (isNaN(testResult[0])) {
    console.log('錯誤！！！準備倒回首頁')
    res.redirect('/insertLesson')
  } else {
    Record.findOne({ 'username': req.user.username, 'lesson.lessonId': req.params.lessonId }, {'lesson.$': 1}, function (err, lessonExist) {
      var testRecord = totalResult / (4 * testResult.length)
      if (err) {
        throw err
      } else if (!lessonExist) {
        Record.findOneAndUpdate(
          {username: req.user.username},
          {$push: {
            lesson: {
              lessonId: req.params.lessonId,
              wordFamiliarity: testResultOrder,
              testTimes: 1,
              testRecord: testRecord,
              lessonFamilarity: parseInt(testRecord * 100)
            }
          }
          },
          function (err, result) {
            if (err) {
              throw err
            }
          }
        )
        console.log('增加到資料庫')
      } else {
        var testTimes = lessonExist.lesson[0].testTimes + 1
        var lessonFamilarity = 0
        for (var i = 0; i < numlist.length; i++) {
          lessonExist.lesson[0].wordFamiliarity[i] = parseInt(lessonExist.lesson[0].wordFamiliarity[i]) + parseInt(testResultOrder[i])
        }
        for (i = 0; i < testTimes - 1; i++) {
          lessonFamilarity += lessonExist.lesson[0].testRecord[i]
        }
        Record.update(
          { 'username': req.user.username, 'lesson.lessonId': req.params.lessonId },
          {$set: {
            'lesson.$.wordFamiliarity': lessonExist.lesson[0].wordFamiliarity,
            'lesson.$.testTimes': testTimes,
            'lesson.$.lessonFamilarity': parseInt(((lessonFamilarity + testRecord) / testTimes) * 100)
          }},
          function (err, result) {
            if (err) {
              throw err
            }
            Record.update(
              {'username': req.user.username, 'lesson.lessonId': req.params.lessonId},
              {$push: { 'lesson.$.testRecord': testRecord }},
              function (err, result) {
                if (err) {
                  throw err
                }
              }
            )
          }
        )
      }
      testResult = [NaN]
      res.redirect('/insertLesson')
    })
  }
})

module.exports = router
