var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')
var Record = require('../models/record.js')

// get單字列表
var lessonList = {}
var wordTotalScore = []
router.get('/lesson/:lessonId', function (req, res, next) {
  Lesson.findOne({_id: req.params.lessonId}, function (err, lesson) {
    if (err) {
      throw err
    } else {
      lessonList = lesson
      if (req.isAuthenticated() === true) {
        Record.findOne({'username': req.user.username, 'lesson.lessonId': req.params.lessonId}, {'lesson.$': 1}, function (err, recordResult) {
          if (err) {
            throw err
          } else if (!recordResult) {
            for (var i = 0; i < 10; i++) {
              wordTotalScore[i] = NaN
            }
          } else {
            if (recordResult.lesson[0].testTimes === 0) {
              for (i = 0; i < 10; i++) {
                wordTotalScore[i] = NaN
              }
            } else {
              for (i = 0; i < recordResult.lesson[0].wordTotalScore.length; i++) {
                wordTotalScore[i] = parseInt(recordResult.lesson[0].wordTotalScore[i] * 100 / (4 * recordResult.lesson[0].testTimes))
              }
            }
          }
          res.render('insertWord', { wordTotalScore: wordTotalScore, lessonindex: req.params.lessonId, lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
        })
      } else {
        res.render('insertWord', { wordTotalScore: wordTotalScore, lessonindex: req.params.lessonId, lessoninform: lessonList, user: req.user, loginStatus: req.isAuthenticated() })
      }
    }
  })
})

// POST /新增單字
router.post('/lesson/:lessonId/addword', function (req, res) {
  Lesson.findOne({ 'vocabulary.word': req.body.word }, function (err, theWordInDb) {
    console.log('theWordInDb')
    console.log(theWordInDb)
    if (err) {
      throw err
    } else if (!theWordInDb) {
      Lesson.findOneAndUpdate(
        {_id: req.params.lessonId},
        {$push: {vocabulary: {word: req.body.word}}},
        function (err, result) {
          if (err) {
            throw err
          }
          Record.update(
            {lesson: {$elemMatch: {lessonId: req.params.lessonId}}},
            {$pull: {
              lesson: {lessonId: req.params.lessonId}
            }},
            {multi: true},
            function (err) {
              if (err) {
                throw err
              }
              var path = '/lesson/' + req.params.lessonId
              res.redirect(path)
            }
          )
        }
      )
    } else {
      console.log('The word already exist!')
      var path = '/lesson/' + req.params.lessonId
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
    })
  Record.update(
    {lesson: {$elemMatch: {lessonId: req.params.lessonId}}},
    {$pull: {
      lesson: {lessonId: req.params.lessonId}
    }},
    {multi: true},
    function (err) {
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
  Lesson.findOne({ 'vocabulary.word': req.body.vocabularyUpdate }, function (err, theWordInDb) {
    console.log('theWordInDb')
    console.log(theWordInDb)
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
          Record.update(
            {lesson: {$elemMatch: {lessonId: req.params.lessonId}}},
            {$pull: {
              lesson: {lessonId: req.params.lessonId}
            }},
            {multi: true},
            function (err) {
              if (err) {
                throw err
              }
              var path = '/lesson/' + req.params.lessonId
              res.redirect(path)
            }
          )
        }
      )
    } else {
      console.log('The word already exist!')
      var path = '/lesson/' + req.params.lessonId
      res.redirect(path)
    }
  })
})

module.exports = router
