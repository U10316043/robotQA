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
    console.log('課程列表');
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
    console.log('新增課程');
    var newLesson = new Lesson();
    newLesson.lessonNumTable = req.body.lessonNum;
    newLesson.lessonNameTable = req.body.lessonName;
    newLesson.lessonInformationTable = req.body.lessonInformation;
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
    console.log('刪除課程');
    Lesson.findOne({ _id:req.params.lesson_id}, function(err, thelessonid) {
        if(err){
            return done(err)
        }
        else if(!thelessonid){
            console.log("no lesson id error")
        }else{
            var lessonnum = thelessonid.lessonNumTable;
            Vocabulary.deleteMany({ lessonNumTable: lessonnum },function(err, obj) {
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
    console.log('修改課程資訊');    
    Lesson.findById(req.params.lesson_id, function(err, newDb){
        newDb.lessonNumTable = req.body.lessonNum;
        newDb.lessonNameTable = req.body.lessonName;
        newDb.lessonInformationTable = req.body.lessonInformation;
        newDb.save(function (err, newDb) {
            if (err) {  
                throw err;
            } 
            console.log('update the word in database');
        });
    });
    res.redirect('/insertLesson');

})



module.exports = router;