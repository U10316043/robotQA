var express = require('express')
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport');
var Lesson = require('../models/lesson.js');
var Vocabulary = require('../models/vocabulary.js');

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//get課程列表
var lessonlist={}
router.get('/insertLesson', function (req, res, next) {
    Lesson.find(function(err, result){
        if(err){
            throw err;
        }else{
            lessonlist = result;
        }
        res.render('insertLesson', { lessoninform: lessonlist ,user: req.user, loginStatus: req.isAuthenticated() })            
    })     
});

// POST新增課程
router.post('/addlesson', function (req, res) {
    var newLesson = new Lesson();
    newLesson.num = req.body.lessonNum;
    newLesson.name = req.body.lessonName;
    newLesson.info = req.body.lessonInformation;
    newLesson.save(function (err) {
    if (err) {  //angular,react,vue
        throw err;
    }
        //return done(null); //Error: Can't set headers after they are sent. sent response end twice
    });
    // if (!req.body) return res.sendStatus(400)
    res.redirect('/insertLesson');
})

//刪除課程
router.get('/deletecourse/:lesson_id',function (req, res) {
    Lesson.findOne({ _id:req.params.lesson_id}, function(err, thelessonid) {
        if(err){
            return done(err)
        }
        else if(!thelessonid){
            console.log("no lesson id error")
        }else{
            Vocabulary.deleteMany({ lessonId: req.params.lesson_id },function(err, obj) {
                if (err) throw err;
            })
        }
    })
    Lesson.findByIdAndRemove(req.params.lesson_id, function(err) {
    });
    res.redirect('/insertLesson');
})
//修改課程資訊
router.post('/editcourse/:lesson_id',function (req, res) { 
    Lesson.findById(req.params.lesson_id, function(err, newDb){
        newDb.num = req.body.lessonNum;
        newDb.name = req.body.lessonName;
        newDb.info = req.body.lessonInformation;
        newDb.save(function (err, newDb) {
            if (err) {  
                throw err;
            } 
            ('update the word in database');
        });
    });
    res.redirect('/insertLesson');

})



module.exports = router;