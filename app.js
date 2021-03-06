var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

// mongoose connect
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/robotQA')

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session')
var flash = require('connect-flash')
var bcrypt = require('bcrypt-nodejs')
// DB models
var User = require('./models/user.js')
var Record = require('./models/record.js')
var Lesson = require('./models/lesson.js')
var Guess = require('./models/guess.js')
// route
var index = require('./routes/index')
var vocabularyRoute = require('./routes/vocabulary')
var lessonRoute = require('./routes/lesson')
var examRoute = require('./routes/exam')
var performance = require('./routes/performance')
var allRecord = require('./routes/allRecord')
var guessGame = require('./routes/guessGame')
var app = express()
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

passport.serializeUser(function (user, done) {
  done(null, user._id)
})
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})
passport.use('login', new LocalStrategy({
  passReqToCallback: true
},
  function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, req.flash('info', 'User not found.'))
      }
      var isValidPassword = function (user, password) {
        Lesson.find(function (err, lesson) { // 比對recordDB的課程是不是都有更新（含有全部lessonDB的課程）
          if (err) {
            throw err
          } else {
            for (var i = 0; i < lesson.length; i++) {
              console.log(lesson[i]._id)
              Record.update(
                {username: username, lesson: {'$not': { '$elemMatch': { 'lessonId': lesson[i]._id } }}},
                {$addToSet: {
                  lesson: {
                    'lessonId': lesson[i]._id,
                    'lessonNum': lesson[i].num,
                    'lessonName': lesson[i].name
                  }
                }
                },
                function (err, result) {
                  if (err) {
                    throw err
                  }
                }
              )
            }
          }
        })
        return bcrypt.compareSync(password, user.password)
      }
      if (!isValidPassword(user, password)) {
        return done(null, false, req.flash('info', 'Invalid password'))
      }
      return done(null, user)
    })
  }
))
passport.use('ppsignup', new LocalStrategy(
  {
    passReqToCallback: true
  },
  function (req, username, password, done) {
    var findOrCreateUser = function () {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          var message = []
          message.push(capitalize(err.errors[error].message))
          req.flash('error', 'This email is already in our database.')
          return done(err, false, {info: '輸入有誤'})
          // throw(error)
        }
        if (user) {
          return done(null, false, req.flash('info', 'User already exists'))
        } else {
          var newUser = new User()
          newUser.username = username
          newUser.nickname = req.body.nickname
          newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
          newUser.save(function (err, user) {
            if (err) {
              throw err
            }
            Record.insertMany({username: username}, function (err) {
              if (err) {
                throw err
              }
            })
            Lesson.find(function (err, lesson) {
              if (err) {
                throw err
              } else {
                for (var i = 0; i < lesson.length; i++) {
                  Record.findOneAndUpdate(
                    {username: username},
                    {$push: {
                      lesson: {
                        lessonId: lesson[i]._id,
                        lessonNum: lesson[i].num,
                        lessonName: lesson[i].name
                      }
                    }
                    },
                    function (err, result) {
                      if (err) {
                        throw err
                      }
                    }
                  )
                }
              }
            })
            return done(null, user, req.flash('info', '已經進入註冊函數'))
          })
        }
      })
    }
    process.nextTick(findOrCreateUser)
  }
))

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/', index)
app.use('/', vocabularyRoute)
app.use('/', lessonRoute)
app.use('/', examRoute)
app.use('/', performance)
app.use('/', allRecord)
app.use('/', guessGame)

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS");
//   next(err);
// });
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
module.exports = app
