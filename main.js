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












//___________________________________________________________________________________________________

// app.get("/", function (req, res) {
//     let goods = new Promise(function (resolve, reject) {
//         dbConnect.query(
//             "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
//             function (error, result, field) {
//                 if (error) return reject(error);
//                 resolve(result);
//             }
//         );
//     });
//     let catDescription = new Promise(function (resolve, reject) {
//         dbConnect.query(
//             "SELECT * FROM category",
//             function (error, result, field) {
//                 if (error) return reject(error);
//                 resolve(result);
//             }
//         );
//     });
//     Promise.all([goods, catDescription])
//         .then(function (value) {
//             // console.log(value[0]);
//             res.render("index", {
//                 goods: JSON.parse(JSON.stringify(value[0])),
//                 cat: JSON.parse(JSON.stringify(value[1]))
//             });
//         });
// });

// app.get("/cat", function (req, res) {
//     // console.log(req.query.id);
//     let catId = req.query.id;

//     let cat = new Promise(function (resolve, reject) {
//         dbConnect.query(
//             'SELECT * FROM category WHERE id=' + catId,
//             function (error, result) {
//                 if (error) reject(error);
//                 resolve(result);
//             });
//     });

//     let goods = new Promise(function (resolve, reject) {
//         dbConnect.query(
//             'SELECT * FROM goods WHERE category=' + catId,
//             function (error, result) {
//                 if (error) reject(error);
//                 resolve(result);
//             });
//     });
//     Promise.all([cat, goods]).then(function (value) {
//         // console.log(value);
//         res.render("categories", {
//             cat: JSON.parse(JSON.stringify(value[0])),
//             goods: JSON.parse(JSON.stringify(value[1]))
//         });
//     });
// });

// app.get("/goods", function (req, res) {
//     // console.log(req.query.id);
//     dbConnect.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result, fields) {
//         if (error) throw error;
//         res.render("goods", { goods: JSON.parse(JSON.stringify(result)) })
//     });
// });



// app.post("/get-category-list", function (req, res) {
//     // console.log(req.body)
//     dbConnect.query('SELECT id, category FROM category', function (error, result, fields) {
//         if (error) throw error;
//         res.json(result);
//     });
// });

// app.post("/finish-order", function (req, res) {
//     console.log(req.body);
//     if (req.body.key.length != 0) {
//         let key = Object.keys(req.body.key);
//         dbConnect.query('SELECT id, name, cost FROM goods WHERE id IN (' + key.join(',') + ')', function (error, result, fields) {
//             if (error) throw error;
//             console.log(result);
//             sendOrderMail(req.body, result).catch(console.error);
//             res.send('1');
//         });
//     } else {
//         res.send("0");
//     }
// })

// async function sendOrderMail(data, result) {
//     let res = "<h2>Order in Music Store</h2>";
//     let total = 0;
//     for (let i = 0; i < result.length; i++) {
//         res += `<p>${result[i]["name"]} - ${data.key[result[i]["id"]]} - ${result[i]["cost"] * data.key[result[i]["id"]]}$</p>`;
//         total += result[i]["cost"] * data.key[result[i]["id"]];
//     }
//     console.log(res);
//     res += "<hr>";
//     res += `Total ${total} $`;
//     res += `<hr>Phone: ${data.phone}`;
//     res += `<hr>User Name: ${data.userName}`;
//     res += `<hr>Address: ${data.address}`;
//     res += `<hr>Email: ${data.email}`;

//     let testAccount = await nodeMailer.createTestAccount();

//     let transporter = nodeMailer.createTransport({
//         host: "smtp.ethereal.email",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//             user: testAccount.user, // generated ethereal user
//             pass: testAccount.pass, // generated ethereal password
//         },
//     });

//     let mailOption = {
//         from: "<dmytro.karpyuk@gmail.com>",
//         to: "dmytro.karpyuk@gmail.com," + data.email,
//         subject: "Music Store order",
//         text: "Thank you for your order",
//         html: res
//     };

//     let info = await transporter.sendMail(mailOption);
//     console.log("MessageSent: %s", info.messageId);
//     console.log("PreviewSent: %s", nodeMailer.getTestMessageUrl(info));
//     return true;
// }