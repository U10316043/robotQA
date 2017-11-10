var express = require('express')
var router = express.Router()
var Lesson = require('../models/lesson.js')

var numlist = []// 出題單字排序
var wordlist = []// question
var answerWord = []// answer

// get考試
var lessonlist = {}
var lessonId
router.get('/lesson/:lessonId/exam', function (req, res, next) {
  if (req.isAuthenticated() === true) {
    Lesson.findOne({_id: req.params.lessonId}, function (err, lessondb) {
      lessonId = req.params.lessonId
      if (err) {
        throw err
      } else {
        wordlist = []
        lessonlist = lessondb
        var index = lessonlist.vocabulary.length
        for (var i = 0; i < index; i++) {
          numlist[i] = i
        }
        numlist.sort(function (a, b) { return 0.5 - Math.random() })
        for (i = 0; i < index; i++) {
          wordlist[i] = lessonlist.vocabulary[numlist[i]].word
        }
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

module.exports = {
  router,
  wordlist,
  numlist,
  lessonId
}
