/*
  User DB model, used for authenticating pro-tier users and generating a JWT token.
*/

"use strict"

const mongoose = require("mongoose")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

mongoose.Promise = global.Promise
mongoose.set("useCreateIndex", true) // Stop deprecation warning.
//Configure Mongoose
mongoose.connect("mongodb://localhost:27017/pro-auth", {
  useMongoClient: true
})

const { Schema } = mongoose

const UsersSchema = new Schema({
  email: String,
  hash: String,
  salt: String
})

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex")
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex")
}

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex")
  return this.hash === hash
}

UsersSchema.methods.generateJWT = function() {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + 60)

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    },
    "secret"
  )
}

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT()
  }
}

module.exports = mongoose.model("Users", UsersSchema)
