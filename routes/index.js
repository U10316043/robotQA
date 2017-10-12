var express = require('express');
var router = express.Router();
var passport = require('passport');

//get product from article db






//get登入頁
router.get('/', function (req, res, next) {
  res.render('index', { message: req.flash('info') });
});
//post登入頁
router.post('/signin', passport.authenticate('login', {
  successRedirect: '/insertWord',
  failureRedirect: '/',
  failureFlash: true
}));
//get註冊頁
router.get('/getsignup', function (req, res, next) {
  res.render('signup', { message: req.flash('info') });
}); 
//post註冊頁
router.post('/postsignup',passport.authenticate('ppsignup', {
  successRedirect:'/insertWord',
  failureRedirect: '/getsignup',
  failureFlash: true
}));
//


router.get('/signout', function (req, res, next) {
  req.logout()
  res.redirect('/')
});

module.exports = router;