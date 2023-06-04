const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const path = require('path');
const fileupload = require("express-fileupload");
const fs= require("fs");
const randomstring = require("randomstring");


// ****************************************************************

const user = require('./models/user');
const note = require('./models/noteAdd');

// ****************************************************************

app.use('/', express.static(path.join(__dirname, 'static')))

const connection = () => {
    mongoose.connect('mongodb+srv://user232112:232112@notesbook0.opmqs04.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected With Mongo DB');
};

connection();


app.use(cookieParser());
app.use(fileupload());

var session;
app.use(sessions({
    secret: "hberbghebghebghekjnvehibvknseigndfv3234567gfdsdfghjshcvq4d5786efdfwuidhy267kjfneve",
    saveUninitialized:true,
    cookie: { maxAge: (1000 * 60 * 60 * 24 * 2) },
    resave: true 
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));


// ****************************************************************

app.use('/log', (req,res,next) => {
    const session = req.session;
    if(session.userid){
        res.locals.userSession = true;
        next()
    }else{
        res.redirect('/logreg')
    }
})

// ***************************************************************
app.get("/", (req, res) => {
    // res.render("home");
    res.redirect("/logreg");
})

app.get("/logreg", (req, res) => {
    res.render("logreg")
})

app.post("/login", async (req, res) => {
    const cred = {email: req.body.email, password: req.body.pass};
    await user.find(cred)
    .then(ret => {
        if(ret[0]._id){
            session=req.session;
            session.userid=ret[0]._id;
            res.redirect("/log/dashboard")
        }else{
            res.redirect("/logreg")
        }
    }).catch(err => {
        console.log(err)
        res.redirect("/logreg")
    })
})

app.post("/register", async (req, res) => {
    const det = {
        name: req.body.name,
        email: req.body.email,
        password:req.body.pass
    };
    await user.create(det).then(item => {
        session=req.session;
        session.userid=item._id;
        res.redirect("/log/dashboard")
    }).catch(err => {
        console.log(err)
        res.redirect("/logreg")
    })
})

app.get('/log/dashboard', async (req, res) => {
    await user.findById(session.userid).then(async data => {
        await note.find({userId: session.userid }).then(async notes => {
            res.render("dashboard", {userName: data.name, notes})
        }).catch(err => {console.log(err); res.redirect("/")});
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.get('/log/dashboard/add', (req, res) => {
    // const fileName = randomstring.generate() + req.files.img.name;
    // const filePath = __dirname + '/public/hospital-images/' + fileName;
    // req.files.img.mv(filePath).catch(err=> (console.log(err)))
    // obj.image = `/hospital-images/` + fileName;
    res.send("add");
})

app.post('/log/dashboard/add', (req, res) => {
    res.send("add");
})

app.get('/log/dashboard/earning', (req, res) => {
    res.send("Earning");
})

app.get('/log/browse', async (req, res) => {
    await user.findById(session.userid).then(async data => {
        await note.find().then(async notes => {
            res.render("browse", {userName: data.name, notes})
        }).catch(err => {console.log(err); res.redirect("/")});
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.get('/log/browse/:id', (req, res) => {
    res.send("see");
})

app.get("/logout", (req, res) => {
    session = req.session;
    if(session.userid){
        req.session.destroy();
    }
    res.redirect("/logreg")
})

// ****************************************************************

app.listen(8000);