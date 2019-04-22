"use strict";
/*
  This file controls the request-per-minute (RPM) rate limits.

  It is assumed that this middleware is run AFTER the auth.js middleware which
  checks for Basic auth. If the user adds the correct Basic auth to the header
  of their API request, they will get pro-tier rate limits. By default, the
  freemium rate limits apply.
*/
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
Object.defineProperty(exports, "__esModule", { value: true });
// Used for debugging and iterrogating JS objects.
var util = require("util");
util.inspect.defaultOptions = { depth: 1 };
var RateLimit = require("express-rate-limit");
//const Users = require("../models/users")
var UserDB = require("../util/cassandra/cassandra-db");
// Set max requests per minute
var maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
    : 60;
// Pro-tier rate limits are 10x the freemium limits.
var PRO_RPM = 10 * maxRequests;
// Unique route mapped to its rate limit
var uniqueRateLimits = {};
var routeRateLimit = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitTier, path, route, proRateLimits, userDB, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create a res.locals object if not passed in.
                    if (!req.locals)
                        req.locals = {};
                    // Disable rate limiting if 0 passed from RATE_LIMIT_MAX_REQUESTS
                    if (maxRequests === 0)
                        return [2 /*return*/, next()
                            // Current route
                        ];
                    rateLimitTier = req.locals.proLimit ? "PRO" : "BASIC";
                    path = req.baseUrl + req.path;
                    route = rateLimitTier +
                        req.method +
                        path
                            .split("/")
                            .slice(0, 4)
                            .join("/");
                    proRateLimits = req.locals.proLimit;
                    if (!req.payload) return [3 /*break*/, 3];
                    if (!!proRateLimits) return [3 /*break*/, 3];
                    return [4 /*yield*/, validateJWT(req)];
                case 1:
                    proRateLimits = _a.sent();
                    console.log(" ");
                    console.log("Retrieving users list from Cassandra DB:");
                    userDB = new UserDB();
                    return [4 /*yield*/, userDB.readAllUsers()];
                case 2:
                    users = _a.sent();
                    console.log("users: " + JSON.stringify(users, null, 2));
                    console.log(" ");
                    _a.label = 3;
                case 3:
                    // Pro level rate limits
                    if (proRateLimits) {
                        // TODO: replace the console.logs with calls to our logging system.
                        //console.log(`applying pro-rate limits`)
                        // Create new RateLimit if none exists for this route
                        if (!uniqueRateLimits[route]) {
                            uniqueRateLimits[route] = new RateLimit({
                                windowMs: 60 * 1000,
                                delayMs: 0,
                                max: PRO_RPM,
                                handler: function (req, res /*next*/) {
                                    //console.log(`pro-tier rate-handler triggered.`)
                                    res.status(429); // https://github.com/Bitcoin-com/rest.bitcoin.com/issues/330
                                    return res.json({
                                        error: "Too many requests. Limits are " + PRO_RPM + " requests per minute."
                                    });
                                }
                            });
                        }
                        // Freemium level rate limits
                    }
                    else {
                        // TODO: replace the console.logs with calls to our logging system.
                        //console.log(`applying freemium limits`)
                        // Create new RateLimit if none exists for this route
                        if (!uniqueRateLimits[route]) {
                            uniqueRateLimits[route] = new RateLimit({
                                windowMs: 60 * 1000,
                                delayMs: 0,
                                max: maxRequests,
                                handler: function (req, res /*next*/) {
                                    //console.log(`freemium rate-handler triggered.`)
                                    res.status(429); // https://github.com/Bitcoin-com/rest.bitcoin.com/issues/330
                                    return res.json({
                                        error: "Too many requests. Limits are " + maxRequests + " requests per minute."
                                    });
                                }
                            });
                        }
                    }
                    // Call rate limit for this route
                    uniqueRateLimits[route](req, res, next);
                    return [2 /*return*/];
            }
        });
    });
};
exports.routeRateLimit = routeRateLimit;
function validateJWT(req) {
    return __awaiter(this, void 0, void 0, function () {
        var id, user, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = void 0;
                    // Get the ID from the JWT token.
                    if (req.payload) {
                        id = req.payload.idconsole.log(" ");
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, UserDB.findById(id)];
                case 1:
                    user = _a.sent();
                    console.log("user: " + util.inspect(user));
                    // By default, return false
                    return [2 /*return*/, false];
                case 2:
                    err_1 = _a.sent();
                    // By default, return false
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
