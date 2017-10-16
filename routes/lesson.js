var express = require('express')
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport');
var Lesson = require('../models/lesson.js');

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var lessonlist={}
router.get('/insertLesson', function (req, res, next) {
    console.log('課程首頁');
    Lesson.find(function(err, result){
        if(err){
            throw err;
        }else{
            lessonlist = result;
        }
        res.render('insertLesson', { lessoninform: lessonlist ,user: req.user, loginStatus: req.isAuthenticated() })            
    })     
});

// POST /login gets urlencoded bodies
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


module.exports = router;