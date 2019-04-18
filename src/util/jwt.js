/*
  A library for working with JWT tokens and hashing user passwords
*/

"use strict"

const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const wlogger = require("./winston-logging")

class JWT {
  // Accepts a user data object. Adds a salt and hash of the password, then
  // returns the user data object.
  setPassword(user) {
    try {
      // Generate a random number
      user.salt = crypto.randomBytes(16).toString("hex")

      // Hash the password
      user.hash = crypto
        .pbkdf2Sync(user.password, user.salt, 10000, 512, "sha512")
        .toString("hex")

      return user
    } catch (err) {
      wlogger.error(`Error in jwt.js/setPassword().`)
      throw err
    }
  }

  // Returns a Boolean. True if the hashed password matches the hash saved in
  // the user object. Otherwise returns false.
  validatePassword(user) {
    try {
      const hash = crypto
        .pbkdf2Sync(user.password, user.salt, 10000, 512, "sha512")
        .toString("hex")

      return user.hash === hash
    } catch (err) {
      wlogger.error(`Error in jwt.js/validatePassword()`, err)
      return false
    }
  }

  // Generate a JWT token for a user data object.
  generateJWT(user) {
    try {
      const today = new Date()
      const expirationDate = new Date(today)

      // Set experation for 30 days from now.
      expirationDate.setDate(today.getDate() + 30)

      return jwt.sign(
        {
          email: user.email,
          id: user._id,
          exp: parseInt(expirationDate.getTime() / 1000, 10)
        },
        "secret"
      )
    } catch (err) {
      throw err
    }
  }

  toAuthJSON(user) {
    try {
      return {
        _id: user._id,
        email: user.email,
        token: this.generateJWT(user)
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = JWT
