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

const JWT = require("../../util/jwt")
const jwt = new JWT()

//const mongoose = require("mongoose")

//Configure mongoose's promise to global promise
//mongoose.Promise = global.Promise

//const passport = require("passport")
//const auth = require("../auth")
//require("../../models/users")
//const Users = mongoose.model("Users")
const Users = require("../../models/users")

const UserDB = require("../../util/cassandra/cassandra-db")
const userDB = new UserDB()

router.get("/", root)
router.post("/", newUser)
router.post("/createUser", newUser2)
router.post("/login", login)
router.post("/login2", login2)
router.get("/current", current)

function root(req, res, next) {
  return res.json({ status: "user" })
}

async function newUser2(req, res, next) {
  try {
    const user = req.body.user

    if (!user.email) {
      res.status(422)
      return res.json({
        errors: {
          email: "is required"
        }
      })
    }

    if (!user.password) {
      res.status(422)
      return res.json({
        errors: {
          password: "is required"
        }
      })
    }

    console.log(`Original user object: ${JSON.stringify(user, null, 2)}`)

    // TODO: replace password with a hash.
    jwt.setPassword(user)

    //console.log(`New user object: ${JSON.stringify(newUser, null, 2)}`)

    await userDB.createUser(user)

    return res.json({ success: true })
  } catch (err) {
    console.error(`Error in user.js/newUser2(): `, err)
  }
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
async function login2(req, res, next) {
  try {
    const user = req.body.user

    if (!user.email) {
      res.status(422)
      return res.json({
        errors: {
          email: "is required"
        }
      })
    }

    if (!user.password) {
      res.status(422)
      return res.json({
        errors: {
          password: "is required"
        }
      })
    }

    console.log(`Attempting to log in user: ${JSON.stringify(user, null, 2)}`)

    const userData = await userDB.lookupUser(user.email)

    console.log(`userData: ${JSON.stringify(userData, null, 2)}`)

    return res.json({ success: true })
  } catch (err) {
    console.error(`Error in user.js/login2(): `, err)
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
