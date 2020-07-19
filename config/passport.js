// const passport = require('passport')

const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load User model
const User = require('../models/User')
const { use } = require('passport')

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            User.findOne({ email: email }).then((user) => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' })
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err

                    if (isMatch) {
                        return done(null, user)
                    }
                    else {
                        return done(null, false, { message: 'Password incorrect' })
                    }
                })
            }).catch(err => console.log(err))
        })
    )
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}




// passport.serializeUser((user, done) => {
//     done(null, user.id)
// })

// passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => {
//         done(err, user)
//     })
// })

// passport.use('local.signup', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     User.findOne({ 'email': email }, (err, user) => {
//         if (err) {
//             return done(err)
//         }
//         if (user) {
//             return done(null, false, { message: 'Email is already in use.' })
//         }
//         const newUser = new User()
//         newUser.email = email
//         newUser.password = password.encryptPassword(password)
//         newUser.save((err, result) => {
//             if (err) {
//                 return done(err)
//             }
//             return done(null, newUser)
//         })
//     })
// }))