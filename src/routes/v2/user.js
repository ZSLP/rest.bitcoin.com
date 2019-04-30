/*
  Routes for user authentication.
 */

"use strict"

// Used for debugging and iterrogating JS objects.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

const express = require("express")
const router = express.Router()
const CashID = require("cashid")

const wlogger = require("../../util/winston-logging")

const JWT = require("../../util/jwt")
const jwt = new JWT()

//const mongoose = require("mongoose")

//Configure mongoose's promise to global promise
//mongoose.Promise = global.Promise

const passport = require("passport")
//const auth = require("../auth")
//require("../../models/users")
//const Users = mongoose.model("Users")
//const Users = require("../../models/users")

const UserDB = require("../../util/cassandra/cassandra-db")
const userDB = new UserDB()

router.get("/", root)
router.post("/", newUser)
router.post("/login", login)
router.post("/delete", deleteUser)
router.post("/cashid", cashId)

function root(req, res, next) {
  return res.json({ status: "user" })
}

async function cashId(req, res, next) {
  try {
    const body = req.body
    console.log(`body params: ${JSON.stringify(body, null, 2)}`)

    const domain = "rest.bchtest.net"
    const path = "/v2/user/cashid"
    const cashid = new CashID(domain, path)

    // This will throw an error if the CashID request can not be validated.
    const parsed = cashid.validateRequest(body)
    console.log(`parsed: ${util.inspect(parsed)}`)

    // If user does not exist, create a new user.

    // Login user and return JWT token.

    return res.json({ success: true })
  } catch (err) {
    console.error(`Error in user.js/cashId(): `, err)
  }
}

async function newUser(req, res, next) {
  try {
    const user = req.body.user

    // Input Validation.
    if (!user) {
      res.status(422)
      return res.json({
        errors: {
          message: "user body required"
        }
      })
    }

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

    //console.log(`Original user object: ${JSON.stringify(user, null, 2)}`)

    // Replace the password with a cryptographic hash.
    // This is best-practice, as the DB doesn't actually store the users password,
    // so no chance of leaking private user data if the DB is hacked.
    jwt.setPassword(user)

    //console.log(`New user object: ${JSON.stringify(newUser, null, 2)}`)

    await userDB.createUser(user)

    return res.json({ success: true })
  } catch (err) {
    console.error(`Error in user.js/newUser2(): `, err)
  }
}

//POST login route (optional, everyone has access)
async function login(req, res, next) {
  try {
    const user = req.body.user

    // Input Validation.
    if (!user) {
      res.status(422)
      return res.json({
        errors: {
          message: "user body required"
        }
      })
    }

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

    const userData = await userDB.findByEmail(user.email)

    console.log(`userData: ${JSON.stringify(userData, null, 2)}`)

    //return res.json({ success: true })

    return passport.authenticate(
      "local",
      { session: false },
      (err, passportUser, info) => {
        if (err) return next(err)

        if (passportUser) {
          console.log(`passportUser: ${JSON.stringify(passportUser, null, 2)}`)

          //const user = passportUser
          passportUser.token = jwt.generateJWT(passportUser)

          return res.json({ user: jwt.toAuthJSON(passportUser) })
          //return res.json({ success: true })
        }

        //return status(400).info
        return res.status(400)
      }
    )(req, res, next)
  } catch (err) {
    console.error(`Error in user.js/login2(): `, err)
  }
}

async function deleteUser(req, res, next) {
  try {
    if (!req.payload) {
      res.status(422)
      return res.json({ error: "jwt token is required" })
    }

    const id = req.payload.id

    if (!id) {
      res.status(422)
      return res.json({ error: "jwt token is required" })
    }

    const data = await userDB.findById(id)
    console.log(`data: ${util.inspect(data)}`)

    if (!data) {
      res.status(422)
      return res.json({ error: `User could not be found` })
    }

    await userDB.deleteUser(id)

    return res.json({ success: true })
  } catch (err) {
    console.error("Errror in users.js/deleteUser()")
    throw err
  }
}

module.exports = { router }
