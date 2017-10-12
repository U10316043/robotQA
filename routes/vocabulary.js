var express = require('express')
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport');
var Vocabulary = require('../models/vocabulary.js');

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var vocabularylist = {}
router.get('/insertWord', function (req, res, next) {
    console.log('首頁');
    Vocabulary.find(function(err, theword){
        if(err){
            throw err;
        }else{
            vocabularylist = theword;
        }
        res.render('insertWord', { vocabularyinform: vocabularylist ,user: req.user, loginStatus: req.isAuthenticated() })            
    })
});

// POST /login gets urlencoded bodies
router.post('/addword', function (req, res) {
    console.log('新增單字');
    Vocabulary.findOne({ vocabularyTable:req.body.word }, function (err, theWordInDb) {
        if (err) {
          return done(err)
        }
        else if (!theWordInDb) {
          var newVocabulary = new Vocabulary();
          newVocabulary.vocabularyTable = req.body.word;
          newVocabulary.save(function (err) {
          if (err) {  //angular,react,vue
              throw err;
          }
              //return done(null); //Error: Can't set headers after they are sent. sent response end twice
          });
        }else{
            console.log('The word already exist!')
        }
    })
    // if (!req.body) return res.sendStatus(400)
    res.redirect('/insertWord');
})
//刪除單字
router.get('/deleteVocabulary/:vocabulary_id',function (req, res) {
    console.log('刪除單字');
    Vocabulary.findByIdAndRemove(req.params.vocabulary_id, function(err){
    });
    res.redirect('/insertWord');
})
//修改單字
router.post('/editVocabulary/:vocabulary_id',function (req, res) {
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
          res.redirect('/insertWord');
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
            console.log("The word "+rearchWord+" is not exist.")
        }else{
            console.log(results)
        }  
    })
    res.redirect('/insertWord');
})
module.exports = router;