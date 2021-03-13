//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const {
  Schema
} = mongoose;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
var lab = require("./config.json");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect("mongodb+srv://" + process.env.MONGO_ID + ":" + process.env.MONGO_PASS + "@asfalis.q8kmi.mongodb.net/userDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  displayName: String,
  photos: String,
  provider: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function (accessToken, refreshToken, profile, done) {
    app.set('id', profile.id);
    app.set('provider', profile.provider);
    User.findOne({
      googleId: profile.id,
    }, function (err, user) {
      if (err) {
        return done(err, user);
      } else {
        if (!user) {
          const user = new User({
            email: profile.emails[0].value,
            googleId: profile.id,
            displayName: profile.displayName,
            photos: profile.photos[0].value,
            provider: profile.provider
          });
          user.save();
          return done(err, user);
        }
        return done(err, user);
      }
    });
  }
));

app.route('/')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/secrets');
    } else {
      res.render('home');
    }
  });

app.route('/register')
  .get(function (req, res) {
    res.render('register');
  })
  .post(function (req, res) {
    User.register({
      username: req.body.username
    }, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });
  });

app.route('/login')
  .get(function (req, res) {
    res.render('login');
  })
  .post(function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });
  });

app.route('/logout')
  .get(function (req, res) {
    req.logout();
    res.redirect('/');
  })

app.route('/auth/google')
  .get(passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  }))

app.route('/auth/google/secrets')
  .get(passport.authenticate('google', {
      failureRedirect: '/'
    }),
    function (req, res) {
      res.redirect('/secrets');
    });

app.route('/secrets')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      User.findOne({
        googleId: app.get('id'),
        provider: app.get('provider')
      }, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.render('secrets', {
            user: user
          });
        }
      });
    } else {
      res.redirect('/');
    }
  })
  .post(function (req, res) {
    res.redirect('/index')
  });

app.route('/index')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render('index');
    } else {
      res.redirect('/');
    }
  });

app.route('/tutorial')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render('underC');
    } else {
      res.redirect('/');
    }
  });

app.route('/resource')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render('underC');
    } else {
      res.redirect('/');
    }
  });

app.route('/lab')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render("lab", {
        labxss: lab.xss,
        labsqli: lab.sqli,
        labCI: lab.ci,
      })
    } else {
      res.redirect('/');
    }
  });
app.route('/about')
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render('team');
    } else {
      res.redirect('/');
    }
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening");
});