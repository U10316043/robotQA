var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')

var wordlist = []
var answerWord = []

// get考試

var lessonlist = {}
router.get('/lesson/:lessonId/exam', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
      if (err) {
        throw err
      } else {
        wordlist = []
        lessonlist = lessondb
        var index = lessonlist.vocabulary.length
        for (var i = 0; i < index; i++) {
          wordlist.push(lessonlist.vocabulary[i].word)
        }
        wordlist.sort(function (a, b) { return 0.5 - Math.random() })
        answerWord = []
        for (i = 0; i < index; i++) {
          answerWord[i] = wordlist[i].toUpperCase().split('').join(' ')
        }
        res.render('exam', { question: wordlist, answer: answerWord, lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
      }
    })
  } else {
    res.render('error')
  }
})

// get考試
router.get('/1/vocabulary', function (req, res, next) {
  res.json({success: true, question: wordlist, answer: answerWord})
})

// 接收成績
router.post('/1/perlessonScore', function (req, res) {
  res.send({status: 'success', testResult: req.query.testResult})
})

module.exports = router
