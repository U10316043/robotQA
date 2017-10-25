var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')

// get單字列表
var lessonlist = {}
router.get('/lesson/:lessonId', function (req, res, next) {
  Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
    if (err) {
      throw err
    } else {
      lessonlist = lessondb
      res.render('insertWord', { lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
    }
  })
})

// POST /新增單字
router.post('/lesson/:lessonId/addword', function (req, res) {
  Lesson.findOne({ vocabulary: {word: req.body.word} }, function (err, theWordInDb) {
    if (err) {
      throw err
    } else if (!theWordInDb) {
      Lesson.findOneAndUpdate(
        {_id: req.params.lessonId},
        {$push: {vocabulary: {_id: req.params.lessonId, word: req.body.word}}},
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
    }
  })
})

// 刪除單字
router.get('/lesson/:lessonId/deleteVocabulary/:word', function (req, res) {
  Lesson.findOneAndUpdate(
    {'_id': req.params.lessonId},
    {$pull: {vocabulary: {word: req.params.word}}},
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
        {'_id': req.params.lessonId, 'vocabulary.word': req.params.word},
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
