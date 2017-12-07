var express = require('express')
var router = express.Router()
var Guess = require('../models/guess.js')

var guessList = {}
// get課程列表
router.get('/guessgame', function (req, res, next) {
  Guess.find(function (err, guess) {
    if (err) {
      throw err
    } else {
      guessList = guess
    }
    res.render('guessGame', {guessinform: guessList, user: req.user, loginStatus: req.isAuthenticated()})
  })
})

// POST /新增題目
router.post('/guessInput', function (req, res) {
  console.log('in the guessInput')
  var newGuess = new Guess()
  newGuess.guessQ = req.body.guessQ
  newGuess.guessA = req.body.guessA
  newGuess.save(function (err) {
    if (err) {
      throw err
    }
    res.redirect('/guessgame')
  })
})

// 刪除題目
router.get('/guessDelete/:guess_id', function (req, res) {
  Guess.findByIdAndRemove(req.params.guess_id, function (err) {
    if (err) {
      throw err
    }
  })
  res.redirect('/guessgame')
})

// 修改題目
router.post('/guessEdit/:guess_id', function (req, res) {
  Guess.findOneAndUpdate(
    {'_id': req.params.guess_id},
    {$set: {
      'guessQ': req.body.guessQUpdate,
      'guessA': req.body.guessAUpdate
    }},
    function (err, result) {
      if (err) {
        throw err
      }
      res.redirect('/guessgame')
    }
  )
})

var randomnum
// get考試
router.get('/1/guess', function (req, res, next) {
  Guess.find({}, function (err, guess) {
    if (err) {
      throw err
    } else {
      guessList = guess
      randomnum = parseInt(Math.random() * guessList.length)
      res.json({success: true, question: guess[randomnum].guessQ, answer: guess[randomnum].guessA})
    }
  })
})

// get 網頁版guess
router.get('/guessWebGame', function (req, res, next) {
  Guess.find(function (err, guess) {
    if (err) {
      throw err
    } else {
      guessList = guess
      res.render('guessWebGame', {index: randomnum, guessinform: guessList, user: req.user, loginStatus: req.isAuthenticated()})    
    }
  })
})

module.exports = router
