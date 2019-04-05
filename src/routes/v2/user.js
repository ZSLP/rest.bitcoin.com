/*
  Routes for user authentication.
 */

"use strict"

// Used for debugging and iterrogating JS objects.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

const express = require("express")
const router = express.Router()

const wlogger = require("../../util/winston-logging")

//const mongoose = require("mongoose")

//Configure mongoose's promise to global promise
//mongoose.Promise = global.Promise

//const passport = require("passport")
//const auth = require("../auth")
//require("../../models/users")
//const Users = mongoose.model("Users")
const Users = require("../../models/users")

router.get("/", root)
router.post("/", newUser)
router.post("/login", login)
router.get("/current", current)

function root(req, res, next) {
  return res.json({ status: "user" })
}

//POST new user route (optional, everyone has access)
async function newUser(req, res, next) {
  try {
    const {
      body: { user }
    } = req

    console.log(`user: ${util.inspect(user)}`)

    if (!user.email) {
      return res.status(422).json({
        errors: {
          email: "is required"
        }
      })
    }

    if (!user.password) {
      return res.status(422).json({
        errors: {
          password: "is required"
        }
      })
    }

    const finalUser = new Users(user)

    finalUser.setPassword(user.password)
    console.log(`password set`)

    await finalUser.save()

    console.log(`user saved!`)

    return res.json({ user: finalUser.toAuthJSON() })

    //return finalUser.save().then(() => res.json({ user: finalUser.toAuthJSON() }))
  } catch (err) {
    console.log(`Error in user.js/newUser(): `, err)
  }
}

//POST login route (optional, everyone has access)
function login(req, res, next) {
  const {
    body: { user }
  } = req

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required"
      }
    })
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    })
  }

  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) return next(err)

      if (passportUser) {
        const user = passportUser
        user.token = passportUser.generateJWT()

        return res.json({ user: user.toAuthJSON() })
      }

      return status(400).info
    }
  )(req, res, next)
}

//GET current route (required, only authenticated users have access)
function current(req, res, next) {
  const {
    payload: { id }
  } = req

  return Users.findById(id).then(user => {
    if (!user) return res.sendStatus(400)

    return res.json({ user: user.toAuthJSON() })
  })
}

module.exports = { router }
