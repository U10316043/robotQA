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
router.get('/lesson/:lessonNum', function (req, res, next) {
    console.log('單字列表');
    Vocabulary.find(function(err, vocabularydb){
        if(err){
            throw err;
        }else{
            vocabularylist = vocabularydb;
            Lesson.find(function(err, lessondb){
                if(err){
                    throw err;
                }else{
                    lessonlist = lessondb;
                    
                }
            })
        }
        res.render('insertWord', { lessonindex: req.params.lessonNum ,lessoninform: lessonlist ,vocabularyinform: vocabularylist ,user: req.user, loginStatus: req.isAuthenticated() })                    
    })
    
});
// POST /新增單字
router.post('/lesson/:lessonNum/addword', function (req, res) {
    console.log('新增單字');
    Vocabulary.findOne({ vocabularyTable:req.body.word }, function (err, theWordInDb) {
        if (err) {
          return done(err)
        }
        else if (!theWordInDb) {
          var newVocabulary = new Vocabulary();
          newVocabulary.vocabularyTable = req.body.word;
          newVocabulary.lessonNumTable = req.params.lessonNum;        
          var path = '/lesson/'+req.params.lessonNum
          newVocabulary.save(function (err) {
          if (err) {  //angular,react,vue
              throw err;
          }
              //return done(null); //Error: Can't set headers after they are sent. sent response end twice
          });
          res.redirect(path);
        }else{
            console.log('The word already exist!')
        }
    })
    // if (!req.body) return res.sendStatus(400)

})
//刪除單字
router.get('/lesson/:lessonNum/deleteVocabulary/:vocabulary_id',function (req, res) {
    console.log('刪除單字');
    Vocabulary.findByIdAndRemove(req.params.vocabulary_id, function(err){
    });
    var path = '/lesson/'+req.params.lessonNum
    res.redirect(path);
})
//修改單字
router.post('/lesson/:lessonNum/editVocabulary/:vocabulary_id',function (req, res) {
    console.log('修改單字');    
    Vocabulary.findOne({ vocabularyTable:req.body.vocabularyUpdate }, function (err, theWordInDb) {
        if (err) {
            return done(err)
          }
          else if (!theWordInDb) {
            Vocabulary.findById(req.params.vocabulary_id, function(err, newDb){
                newDb.vocabularyTable = req.body.vocabularyUpdate;
                newDb.save(function (err, newDb) {
                    if (err) {  
                        throw err;
                    } 
                    console.log('update the word in database');
                });
            });
          }else{
              console.log('The word already exist!')
          }
          var path = '/lesson/'+req.params.lessonNum
          res.redirect(path);
    })
})
//查詢單字
router.post('/search', function(req,res) {
    console.log('查詢單字')
    var searchWord = req.body.searchWord
    Vocabulary.find({vocabularyTable:{$regex: searchWord}}, function(err,results) {
        if(err){
            throw err;
        }else if(!results){
            console.log("The word "+searchWord+" is not exist.")
        }else{
            console.log(results)
        }  
    })
    res.redirect('/insertLesson');
})
module.exports = router;