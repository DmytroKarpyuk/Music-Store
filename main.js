// Express.js
const express = require('express')
const app = express()
// MongoDB
const mongoose = require('mongoose')
// DB Config
const db = require('./config/keys').MongoURI
// Handlebars
const exphbs = require('express-handlebars')
// Connect flash
const flash = require('connect-flash')
// Express fession
const session = require('express-session')
// Passport
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
// Routes index.js 
const index = require('./routes')
// Routes user.js
const user = require('./routes/user')

// const nodeMailer = require('nodemailer') // NODEMAILER

// Passport config
require('./config/passport')(passport)

// IF port exiist || ELSE use port 3000
const port = process.env.port || 3000

// Handlebars config
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        ifEquals: function (value1, value2) {
            return value1 == value2;
        },
        ifNotEquals: function (value1, value2) {
            return value1 != value2;
        }
    }
})
// Reserve view engine
app.engine('hbs', hbs.engine)
// Set view engine 
app.set('view engine', 'hbs')

// Read static files('folder name')
app.use(express.static('public'))

// Bodyparser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash())

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.login = req.isAuthenticated()
    res.locals.session = req.session
    next()
})

// Use routes
app.use('/user', user)
app.use('/', index)

// Start app and connect to database
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.listen(port, () => {
    console.log(`Server started on ${port}`)
})
