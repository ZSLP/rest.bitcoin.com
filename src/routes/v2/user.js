/*
  Routes for user authentication.
 */

"use strict"

const express = require("express")
const router = express.Router()

const wlogger = require("../../util/winston-logging")

const mongoose = require("mongoose")
//const passport = require("passport")
//const auth = require("../auth")
require("../../models/users")
const Users = mongoose.model("Users")

router.get("/", root)
router.post("/", newUser)
router.post("/login", login)
router.get("/current", current)

function root(req, res, next) {
  return res.json({ status: "user" })
}

//POST new user route (optional, everyone has access)
function newUser(req, res, next) {
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

  const finalUser = new Users(user)

  finalUser.setPassword(user.password)

  return finalUser.save().then(() => res.json({ user: finalUser.toAuthJSON() }))
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
