var express = require('express')
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport');
var Vocabulary = require('../models/vocabulary.js');
var Lesson = require('../models/lesson.js');

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//get單字列表
var vocabularylist = {}
var lessonlist = {}
router.get('/lesson/:lessonId', function (req, res, next) {
    Lesson.findOne({ _id: req.params.lessonId}, function(err, lessondb){
        if(err){
            throw err;
        }else{
            Vocabulary.find(function(err, vocabulary){
                if(err){
                    throw err;
                }else{
                    vocabularylist = vocabulary;
                    lessonlist = lessondb;
                }
                res.render('insertWord', { lessonindex: req.params.lessonId ,lessoninform: lessonlist ,vocabularyinform: vocabularylist ,user: req.user, loginStatus: req.isAuthenticated() })                    
            })
        }
    })

});

// POST /新增單字
router.post('/lesson/:lessonId/addword', function (req, res) {
    Vocabulary.findOne({ word:req.body.word }, function (err, theWordInDb) {
            if (err) {
            return done(err)
            }
            else if (!theWordInDb) {
                var newVocabulary = new Vocabulary();
                newVocabulary.word = req.body.word;
                newVocabulary.lessonId = req.params.lessonId;        
                var path = '/lesson/'+req.params.lessonId
                newVocabulary.save(function (err) {
                    if (err) {  //angular,react,vue
                        throw err;
                    }
                });
                res.redirect(path);
            }else{
                console.log('The word already exist!')
            }
        })
})

//刪除單字
router.get('/lesson/:lessonId/deleteVocabulary/:vocabulary_id',function (req, res) {
    Vocabulary.findByIdAndRemove(req.params.vocabulary_id, function(err){
    });
    var path = '/lesson/'+req.params.lessonId
    res.redirect(path);
})
//修改單字
router.post('/lesson/:lessonId/editVocabulary/:vocabulary_id',function (req, res) { 
    Vocabulary.findOne({ word:req.body.vocabularyUpdate }, function (err, theWordInDb) {
        if (err) {
            return done(err)
          }
          else if (!theWordInDb) {
            Vocabulary.findById(req.params.vocabulary_id, function(err, newDb){
                newDb.word = req.body.vocabularyUpdate;
                newDb.save(function (err, newDb) {
                    if (err) {  
                        throw err;
                    } 
                });
            });
          }else{
              console.log('The word already exist!')
          }
          var path = '/lesson/'+req.params.lessonId
          res.redirect(path);
    })
})

module.exports = router;