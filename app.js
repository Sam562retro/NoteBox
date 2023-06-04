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
            res.render("dashboard", {tokens: data.tokens, userName: data.name, notes})
        }).catch(err => {console.log(err); res.redirect("/")});
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.get('/log/dashboard/add', async (req, res) => {
    await user.findById(session.userid).then(async data => {
            res.render("add", {tokens: data.tokens, userName: data.name})
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.post('/log/dashboard/add', async (req, res) => {
    obj = {
        topic: req.body.fname,
        class: req.body.class,
        subject: req.body.subject,
        userId: session.userid
    };

    const fileName = randomstring.generate() + req.files.file.name;
    const filePath = __dirname + '/static/noteSave/' + fileName;
    req.files.file.mv(filePath).catch(err=> (console.log(err)))
    obj.filePath = `/noteSave/` + fileName;
    await note.create(obj).then(item => {
        user.findOneAndUpdate({_id: session.userid}, {$inc: {tokens: 30}}).catch(err => {console.log(err); res.redirect("/log/browse")});
        res.redirect("/log/dashboard");
    }).catch(err => {
        console.log(err)
        res.redirect("/log/dashboard/add");
    })
})

app.get('/log/dashboard/earning', async (req, res) => {
    await user.findById(session.userid).then(async data => {
        res.render("money", {money: data.money, tokens: data.tokens, userName: data.name})
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.get('/log/browse', async (req, res) => {
    await user.findById(session.userid).then(async data => {
        await note.find().then(async notes => {
            res.render("browse", {tokens: data.tokens, userName: data.name, notes})
        }).catch(err => {console.log(err); res.redirect("/")});
    }).catch(err => {console.log(err); res.redirect("/")});
})

app.get('/log/browse/:id', async (req, res) => {
    await note.findById(req.params.id).then(async data => {
        user.findById(session.userid).then(h => {
            if(h.tokens > 10){
                user.findOneAndUpdate({_id: session.userid}, {$inc: {tokens: -10}}).catch(err => {console.log(err); res.redirect("/log/browse")});
                user.findOneAndUpdate({_id: data.userId}, {$inc: {money: 10}}).catch(err => {console.log(err); res.redirect("/log/browse")});
                res.render("pdf", {data})
            }else{
                res.redirect("/log/browse");
            }
        })
    }).catch(err => {console.log(err); res.redirect("/")});
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