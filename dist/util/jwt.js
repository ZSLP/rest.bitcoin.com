/*
  A library for working with JWT tokens and hashing user passwords

  TODO:
  -Replace private key in generateJWT() with an environment variable.
*/
"use strict";
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var wlogger = require("./winston-logging");
var JWT = /** @class */ (function () {
    function JWT() {
    }
    // Accepts a user data object. Adds a salt and hash of the password, then
    // returns the user data object.
    JWT.prototype.setPassword = function (user) {
        try {
            // Generate a random number
            user.salt = crypto.randomBytes(16).toString("hex");
            // Hash the password
            user.hash = crypto
                .pbkdf2Sync(user.password, user.salt, 10000, 512, "sha512")
                .toString("hex");
            return user;
        }
        catch (err) {
            wlogger.error("Error in jwt.js/setPassword().");
            throw err;
        }
    };
    // Returns a Boolean. True if the hashed password matches the hash saved in
    // the user object. Otherwise returns false.
    JWT.prototype.validatePassword = function (user, password) {
        try {
            var hash = crypto
                .pbkdf2Sync(password, user.salt, 10000, 512, "sha512")
                .toString("hex");
            return user.hash === hash;
        }
        catch (err) {
            wlogger.error("Error in jwt.js/validatePassword()", err);
            return false;
        }
    };
    // Generate a JWT token for a user data object.
    JWT.prototype.generateJWT = function (user) {
        try {
            var today = new Date();
            var expirationDate = new Date(today);
            // Set experation for 30 days from now.
            expirationDate.setDate(today.getDate() + 30);
            return jwt.sign({
                email: user.email,
                id: user.id,
                exp: parseInt(expirationDate.getTime() / 1000, 10)
            }, "secret");
        }
        catch (err) {
            throw err;
        }
    };
    JWT.prototype.toAuthJSON = function (user) {
        try {
            return {
                id: user.id,
                email: user.email,
                token: this.generateJWT(user)
            };
        }
        catch (err) {
            throw err;
        }
    };
    return JWT;
}());
module.exports = JWT;
