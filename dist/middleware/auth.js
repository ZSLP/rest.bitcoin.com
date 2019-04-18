/*
  Handle authorization for bypassing rate limits.

  This file uses the passport npm library to check the header of each REST API
  call for the prescence of a Basic authorization header:
  https://en.wikipedia.org/wiki/Basic_access_authentication

  If the header is found and validated, the req.locals.proLimit Boolean value
  is set and passed to the route-ratelimits.ts middleware.
*/
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var passport = require("passport");
var BasicStrategy = require("passport-http").BasicStrategy;
var AnonymousStrategy = require("passport-anonymous");
var LocalStrategy = require("passport-local");
var mongoose = require("mongoose");
var wlogger = require("../util/winston-logging");
var UserDB = require("../util/cassandra/cassandra-db");
var userDB = new UserDB();
var JWT = require("../util/jwt");
var jwt = new JWT();
// Used for debugging and iterrogating JS objects.
var util = require("util");
util.inspect.defaultOptions = { depth: 2 };
var _this;
// Set default rate limit value for testing
var PRO_PASSes = process.env.PRO_PASS ? process.env.PRO_PASS : "BITBOX";
// Convert the pro-tier password string into an array split by ':'.
var PRO_PASS = PRO_PASSes.split(":");
//wlogger.verbose(`PRO_PASS set to: ${PRO_PASS}`)
// Auth Middleware
var AuthMW = /** @class */ (function () {
    function AuthMW() {
        var _this_1 = this;
        _this = this;
        // Initialize passport for 'anonymous' authentication.
        passport.use(new AnonymousStrategy({ passReqToCallback: true }, function (req, username, password, done) {
            console.log("anonymous auth handler triggered.");
        }));
        //passport.use(new AnonymousStrategy())
        // Initialize passport for 'basic' authentication.
        passport.use(new BasicStrategy({ passReqToCallback: true }, function (req, username, password, done) {
            //console.log(`req: ${util.inspect(req)}`)
            //console.log(`username: ${username}`)
            //console.log(`password: ${password}`)
            // Create the req.locals property if it does not yet exist.
            if (!req.locals)
                req.locals = {};
            // Set pro-tier rate limit to flag to false by default.
            req.locals.proLimit = false;
            // Evaluate the username and password and set the rate limit accordingly.
            //if (username === "BITBOX" && password === PRO_PASS) {
            if (username === "BITBOX") {
                for (var i = 0; i < PRO_PASS.length; i++) {
                    var thisPass = PRO_PASS[i];
                    if (password === thisPass) {
                        console.log(req.url + " called by " + password.slice(0, 6));
                        wlogger.verbose(req.url + " called by " + password.slice(0, 6));
                        // Success
                        req.locals.proLimit = true;
                        break;
                    }
                }
            }
            //console.log(`req.locals: ${util.inspect(req.locals)}`)
            return done(null, true);
        }));
        passport.use(new LocalStrategy({
            usernameField: "user[email]",
            passwordField: "user[password]",
            passReqToCallback: true,
            session: false
        }, function (req, email, password, done) { return __awaiter(_this_1, void 0, void 0, function () {
            var userDataRaw, userData, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Checking against local strategy.");
                        return [4 /*yield*/, userDB.lookupUser(email)];
                    case 1:
                        userDataRaw = _a.sent();
                        userData = userDataRaw[0];
                        //userData.password = password
                        console.log("userData before validating password: " + JSON.stringify(userData, null, 2));
                        isValid = jwt.validatePassword(userData, password);
                        if (isValid) {
                            console.log("Passwords match!");
                            return [2 /*return*/, done(null, userData)];
                        }
                        return [2 /*return*/, done(null, false, {
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
                        ];
                }
            });
        }); }));
    }
    // Middleware called by the route.
    AuthMW.prototype.mw = function () {
        console.log("authenticating with basic or anonymous. (1)");
        var obj = passport.authenticate(["basic", "anonymous"], {
            session: false
        });
        console.log("obj: " + util.inspect(obj));
        return obj;
    };
    return AuthMW;
}());
module.exports = AuthMW;
