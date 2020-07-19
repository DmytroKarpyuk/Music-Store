const { Router } = require('express')
const router = Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
// User model
const User = require('../models/User')

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []
    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }
    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }
    // Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' })
    }

    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            name,
            email,
            password,
            password2
        })
    }
    else {
        // Validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                // User exists
                errors.push({ msg: 'Email is already registered' })
                res.render('user/register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            }
            else {
                const newUser = new User({
                    name,
                    email,
                    password
                })
                // Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        // Set pasword to hashed
                        newUser.password = hash
                        // Save user
                        newUser.save().then(user => {
                            req.flash('success_msg', 'You are now registered and can log in')
                            res.redirect('/user/login')
                        }).catch(err => console.log(err))
                    })
                })
            }
        })
    }
})

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next)
})

// Logout Handle
router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/user/login')
})

module.exports = router