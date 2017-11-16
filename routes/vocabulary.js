var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')

// get單字列表
var lessonlist = {}
var wordTotalScore = []
router.get('/lesson/:lessonId', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
      if (err) {
        throw err
      } else {
        lessonlist = lessondb
        Record.findOne({'username': req.user.username, 'lesson.lessonId': req.params.lessonId}, {'lesson.$': 1}, function (err, recordResult) {
          if (err) {
            throw err
          } else if (!recordResult) {
            for (var i = 0; i < 10; i++) {
              wordTotalScore[i] = 0
            }
          } else {
            console.log(recordResult)
            for (i = 0; i < recordResult.lesson[0].wordTotalScore.length; i++) {
              wordTotalScore[i] = parseInt(recordResult.lesson[0].wordTotalScore[i] * 100 / (4 * recordResult.lesson[0].testTimes))
            }
          }
          res.render('insertWord', { wordTotalScore: wordTotalScore, lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })          
        })
      }
    })
  } else {
    res.render('error')
  }
})

// POST /新增單字
router.post('/lesson/:lessonId/addword', function (req, res) {
  Lesson.findOne({ 'vocabulary.word': req.body.word }, function (err, theWordInDb) {
    if (err) {
      throw err
    } else if (!theWordInDb) {
      console.log('qwqwqwqwqwqwqw')
      Lesson.findOneAndUpdate(
        {_id: req.params.lessonId},
        {$push: {vocabulary: {word: req.body.word}}},
        function (err, result) {
          if (err) {
            throw err
          }
        }
      )
      var path = '/lesson/' + req.params.lessonId
      res.redirect(path)
    } else {
      console.log('The word already exist!')
      path = '/lesson/' + req.params.lessonId
      res.redirect(path)
    }
  })
})

// 刪除單字
router.get('/lesson/:lessonId/deleteVocabulary/:word/:index', function (req, res) {
  Lesson.findOneAndUpdate(
    {'_id': req.params.lessonId},
    {$pull: {vocabulary: {word: req.params.word}}},
    function (err, result) {
      if (err) {
        throw err
      }
      console.log(req.params.word)
    }
  )
  var index = req.params.index
  console.log('index: ' + index)
  Record.update(
    { },
    { $unset: { 'lesson.0.wordTotalScore.index': 1 } },
    { multi: true },
    function (err, result) {
      if (err) {
        throw err
      }
    }
  )
  Record.update(
    { },
    { $pull: { 'lesson.0.wordTotalScore': null } },
    { multi: true },
    function (err, result) {
      if (err) {
        throw err
      }
    }
  )
  var path = '/lesson/' + req.params.lessonId
  res.redirect(path)
})

// 修改單字
router.post('/lesson/:lessonId/editVocabulary/:word', function (req, res) {
  Lesson.findOne({ vocabulary: {word: req.body.word} }, function (err, theWordInDb) {
    if (err) {
      throw err
    } else if (!theWordInDb) {
      console.log('update one')
      Lesson.findOneAndUpdate(
        {'vocabulary.word': req.params.word},
        {$set: {'vocabulary.$.word': req.body.vocabularyUpdate}},
        function (err, result) {
          if (err) {
            throw err
          }
        }
      )
    } else {
      console.log('The word already exist!')
    }
    var path = '/lesson/' + req.params.lessonId
    res.redirect(path)
  })
})

module.exports = router
