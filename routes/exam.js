var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')

// get考試
var lessonlist = {}
router.get('/lesson/:lessonId/exam', function (req, res, next) {
  Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
    if (err) {
      throw err
    } else {
      lessonlist = lessondb
      var index = lessonlist.vocabulary.length
      var randomIndex = Math.floor(Math.random() * index)
      var randomWord = lessonlist.vocabulary[randomIndex].word
      res.render('exam', { randomWord: randomWord, lessonindex: req.params.lessonId, lessoninform: lessonlist, user: req.user, loginStatus: req.isAuthenticated() })
    }
  })
})

// get考試
router.get('/1/vocabulary', function (req, res, next) {
  Lesson.findOne({_id: '59eff3df22a5f70942313b94'}, function (err, lessondb) {
    if (err) {
      throw err
    } else {
      var wordlist = []
      lessonlist = lessondb
      var index = lessonlist.vocabulary.length
      for (var i = 0; i < index; i++) {
        wordlist.push(lessonlist.vocabulary[i].word)
      }
      wordlist.sort(function (a, b) { return 0.5 - Math.random() })
      var answerWord = []
      for (i = 0; i < index; i++) {
        answerWord[i] = wordlist[i].toUpperCase().split('').join(' ')
      }
      res.json({success: 'true', question: wordlist, answer: answerWord})
    }
  })
})

module.exports = router
