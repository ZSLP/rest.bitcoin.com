/*
  Handle authorization for bypassing rate limits.

  This file uses the passport npm library to check the header of each REST API
  call for the prescence of a Basic authorization header:
  https://en.wikipedia.org/wiki/Basic_access_authentication

  If the header is found and validated, the req.locals.proLimit Boolean value
  is set and passed to the route-ratelimits.ts middleware.
*/

"use strict"

const passport = require("passport")
const BasicStrategy = require("passport-http").BasicStrategy
const AnonymousStrategy = require("passport-anonymous")
const LocalStrategy = require("passport-local")
const mongoose = require("mongoose")
const wlogger = require("../util/winston-logging")

const UserDB = require("../util/cassandra/cassandra-db")
const userDB = new UserDB()

const JWT = require("../util/jwt")
const jwt = new JWT()

// Used for debugging and iterrogating JS objects.
const util = require("util")
util.inspect.defaultOptions = { depth: 2 }

let _this

// Set default rate limit value for testing
const PRO_PASSes = process.env.PRO_PASS ? process.env.PRO_PASS : "BITBOX"
// Convert the pro-tier password string into an array split by ':'.
const PRO_PASS = PRO_PASSes.split(":")

//wlogger.verbose(`PRO_PASS set to: ${PRO_PASS}`)

// Auth Middleware
class AuthMW {
  constructor() {
    _this = this

    // Initialize passport for 'anonymous' authentication.

    passport.use(
      new AnonymousStrategy({ passReqToCallback: true }, function(
        req,
        username,
        password,
        done
      ) {
        console.log(`anonymous auth handler triggered.`)
      })
    )

    //passport.use(new AnonymousStrategy())

    // Initialize passport for 'basic' authentication.
    passport.use(
      new BasicStrategy({ passReqToCallback: true }, function(
        req,
        username,
        password,
        done
      ) {
        //console.log(`req: ${util.inspect(req)}`)
        //console.log(`username: ${username}`)
        //console.log(`password: ${password}`)

        // Create the req.locals property if it does not yet exist.
        if (!req.locals) req.locals = {}

        // Set pro-tier rate limit to flag to false by default.
        req.locals.proLimit = false

        // Evaluate the username and password and set the rate limit accordingly.
        //if (username === "BITBOX" && password === PRO_PASS) {
        if (username === "BITBOX") {
          for (let i = 0; i < PRO_PASS.length; i++) {
            const thisPass = PRO_PASS[i]

            if (password === thisPass) {
              console.log(`${req.url} called by ${password.slice(0, 6)}`)
              wlogger.verbose(`${req.url} called by ${password.slice(0, 6)}`)

              // Success
              req.locals.proLimit = true
              break
            }
          }
        }

        //console.log(`req.locals: ${util.inspect(req.locals)}`)

        return done(null, true)
      })
    )

    passport.use(
      new LocalStrategy(
        {
          usernameField: "user[email]",
          passwordField: "user[password]",
          passReqToCallback: true,
          session: false
        },
        async (req, email, password, done) => {
          console.log(`Checking against local strategy.`)

          // Lookup the user from the database.
          const userData = await userDB.lookupUser(email)
          //console.log(`userData: ${util.inspect(userDataRaw)}`)

          /*
          console.log(
            `userData before validating password: ${JSON.stringify(
              userData,
              null,
              2
            )}`
          )
          */

          // Hash the password and see if it matches the saved hash.
          const isValid = jwt.validatePassword(userData, password)

          if (isValid) {
            console.log(`Passwords match!`)
            return done(null, userData)
          }

          return done(null, false, {
            errors: { "email or password": "is invalid" }
          })

          /*
          Users.findOne({ email })
            .then(user => {
              if (!user || !user.validatePassword(password)) {
                return done(null, false, {
                  errors: { "email or password": "is invalid" }
                })
              }

              return done(null, user)
            })
            .catch(done)
          */
        }
      )
    )
  }

  // Middleware called by the route.
  mw() {
    console.log(`authenticating with basic or anonymous. (1)`)
    const obj = passport.authenticate(["basic", "anonymous"], {
      session: false
    })

    console.log(`obj: ${util.inspect(obj)}`)

    return obj
  }
}

module.exports = AuthMW
