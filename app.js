const express = require("express");

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.route('/')
    .get( function (req, res) {
        res.render('home');
    })
    .post(function (req, res){
        res.redirect('/index')
    })

app.route('/index')
    .get(function (req, res){
        res.render('index')
    })

app.route('/tutorial')
    .get(function (req, res) {
        res.send("Tutorial")
    })

app.route('/resource')
    .get(function (req, res) {
        res.send("Resource")
    })
app.route('/lab')
    .get(function (req, res) {
        res.render("lab")
    })
app.route('/about')
    .get(function (req, res) {
        res.render("team")
    })

app.listen(process.env.PORT || 3000, function () {
        console.log("listening on port 3000")
    })
    