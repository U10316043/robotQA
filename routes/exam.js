var express = require('express')
var router = express.Router()
var async = require('async')
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')
var numList = []// 出題單字排序（資料庫中單字的index亂數排序）
var wordList = []// question
var answerWord = []// answer

// 取得考試的lessonId和測驗對象username
var lessonList = {}
var lessonId
var username
router.post('/selectlesson/:lessonId', function (req, res, next) {
  lessonId = req.params.lessonId
  username = req.user.username
  console.log('lessonId' + lessonId)
  res.redirect('/lesson/' + req.params.lessonId + '/exam')
})

// 可以看到
router.get('/lesson/:lessonId/exam', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lesson) {
      lessonId = req.params.lessonId
      if (err) {
        throw err
      } else {
        res.render('exam', { question: wordList, answer: answerWord, lessonindex: req.params.lessonId, lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
      }
    })
  } else {
    res.render('error')
  }
})

// get考試
router.get('/1/vocabulary', function (req, res, next) {
  Lesson.findOne({_id: lessonId}, function (err, lesson) {
    if (err) {
      throw err
    } else {
      wordList = []
      lessonList = lesson
      var index = lessonList.vocabulary.length
      for (var i = 0; i < index; i++) {
        numList[i] = i
      }
      numList.sort(function (a, b) { return 0.5 - Math.random() })
      for (i = 0; i < index; i++) {
        wordList[i] = lessonList.vocabulary[numList[i]].word
      }
      answerWord = []
      for (i = 0; i < index; i++) {
        answerWord[i] = wordList[i].toUpperCase().split('').join(' ')
      }
      console.log('lessonId: ' + lessonId)
      console.log('numList: ' + numList)
      console.log('question: ' + wordList)
      res.json({success: true, question: wordList, answer: answerWord})
    }
  })
})

var testResult = [] // 每個答案的得分(按照出題順序)
var testResultOrder = [] // 每個答案的得分(按照資料庫中單字順序)
var totalResult // 單字得分加總
var everyScoreNum = [0, 0, 0, 0, 0] // 每一得分數量(0 -> 4)

// 接收成績(機器人回傳的)
router.post('/1/perlessonScore', function (req, res) {
  testResult = req.query.testResult // 機器人回傳的陣列
  everyScoreNum = [0, 0, 0, 0, 0] // 每一得分數量 (0 -> 4)
  totalResult = 0
  res.send({status: 'success', testResult: testResult})
  for (var i = 0; i < numList.length; i++) {
    testResultOrder[numList[i]] = testResult[i]
    totalResult = totalResult + parseInt(testResult[i])
    if (testResult[i] === '4') {
      everyScoreNum[4]++
    } else if (testResult[i] === '3') {
      everyScoreNum[3]++
    } else if (testResult[i] === '2') {
      everyScoreNum[2]++
    } else if (testResult[i] === '1') {
      everyScoreNum[1]++
    } else {
      everyScoreNum[0]++
    }
  }
  console.log('lesson ID: ' + lessonId)
  console.log('lessonList ID: ' + lessonList._id + ' , lessonList num :' + lessonList.num)
  console.log('題目: ' + wordList)
  console.log('分數(題目): ' + testResult)
  console.log('numList: ' + numList)
  console.log('單字: ' + lessonList.vocabulary)
  console.log('分數(資料庫): ' + testResultOrder)
  console.log('總得分: ' + totalResult)
  console.log('每一分數的題目個數: ' + everyScoreNum)

  Record.findOne({ 'username': username, 'lesson.lessonId': lessonId }, {'lesson.$': 1}, function (err, lessonExist) {
    var testRecord = totalResult / (4 * wordList.length) // 單字得分加總換算成百分比
    console.log('單字得分加總百分比: ' + testRecord)
    if (err) {
      throw err
    } else if (!lessonExist) { // 無考過試第一次存入資料庫
      console.log('第一次練習！')
      Record.findOneAndUpdate(
        {username: username},
        {$push: {
          lesson: {
            lessonId: lessonId,
            wordTotalScore: testResultOrder,
            testTimes: 1,
            testRecord: testRecord,
            lessonTotalScore: parseInt(testRecord * 100)
          }
        }
        },
        function (err, result) {
          if (err) {
            throw err
          }
        }
      )
    } else {
      console.log('第n次練習！準備存儲！')
      var testTimes = lessonExist.lesson[0].testTimes + 1
      console.log('上一次的單字總分: ' + lessonExist.lesson[0].wordTotalScore)
      for (var i = 0; i < numList.length; i++) {
        lessonExist.lesson[0].wordTotalScore[i] = parseInt(lessonExist.lesson[0].wordTotalScore[i]) + parseInt(testResultOrder[i])
      }
      console.log('這次的單字總分: ' + lessonExist.lesson[0].wordTotalScore)
      var lessonTotalScore = 0
      for (i = 0; i < testTimes - 1; i++) {
        lessonTotalScore += lessonExist.lesson[0].testRecord[i]
      }
      console.log('上一次的課程綜合成績: ' + lessonTotalScore)

      async.auto({
        insertRecord: function () {
          Record.update(
            { 'username': username, 'lesson.lessonId': lessonId },
            {$set: {
              'lesson.$.wordTotalScore': lessonExist.lesson[0].wordTotalScore,
              'lesson.$.testTimes': testTimes,
              'lesson.$.lessonTotalScore': parseInt(((lessonTotalScore + testRecord) / testTimes) * 100)
            }},
            console.log('我來了了'),
            function (err) {
              if (err) {
                throw err
              }
            }
          )
        },
        insertEveryTestScore: function () {
          Record.update(
            {'username': username, 'lesson.lessonId': lessonId},
            {$push: { 'lesson.$.testRecord': testRecord }},
            console.log('我存了了'),
            function (err) {
              if (err) {
                throw err
              }
            }
          )
        }
      })
    }
  })
})

module.exports = {
  router,
  numList,
  wordList,
  testResult
}
