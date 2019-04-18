/*
  A library doing CRUD operations on a Cassandra database.
  The Cassandra DB must be already setup with a keyspace and user table.
  The software to setup Cassandra are in the 'setup' directory.

  TODO:
  -constructor needs to be updated with production settings before deployment.
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
var cassandra = require("cassandra-driver");
// Application specific libraries
var wlogger = require("../winston-logging");
// Used for debugging and iterrogating JS objects.
var util = require("util");
util.inspect.defaultOptions = { depth: 1 };
var UserDB = /** @class */ (function () {
    function UserDB() {
        this.client = new cassandra.Client({
            contactPoints: ["127.0.0.1"],
            localDataCenter: "datacenter1",
            keyspace: "restusers"
        });
    }
    // Create a new user
    UserDB.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        wlogger.silly("Enteried cassandra-db/createUser()");
                        console.log("user data received: " + JSON.stringify(user, null, 2));
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.client.execute("\n      INSERT INTO users(\n        id,\n        email,\n        pass_hash,\n        bch_addr,\n        first_name,\n        last_name,\n        display_name,\n        salt,\n        misc\n      )\n      VALUES(\n        uuid(),\n        '" + user.email + "',\n        '" + user.passwordHash + "',\n        '" + user.bchAddr + "',\n        '" + user.firstName + "',\n        '" + user.lastName + "',\n        '" + user.displayName + "',\n        '" + user.salt + "',\n        '" + user.misc + "'\n      )\n      ")];
                    case 2:
                        data = _a.sent();
                        console.log("user data: " + JSON.stringify(data, null, 2));
                        return [4 /*yield*/, this.client.shutdown()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        wlogger.error("Error in cassandra-db/createUser().");
                        throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Retrieve all users from the database.
    UserDB.prototype.readAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        wlogger.silly("Enteried cassandra-db/readUser()");
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.client.execute("\n      SELECT * FROM users\n      ")];
                    case 2:
                        data = _a.sent();
                        return [4 /*yield*/, this.client.shutdown()
                            //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
                        ];
                    case 3:
                        _a.sent();
                        //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
                        return [2 /*return*/, data.rows];
                    case 4:
                        err_2 = _a.sent();
                        wlogger.error("Error in cassandra-db/readAllUsers()", err_2);
                        throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // update user data
    // TODO: Not yet working.
    UserDB.prototype.updateUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        wlogger.silly("Enteried cassandra-db/updateUser()");
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.client.execute("\n        UPDATE users SET first_name='Steve'\n        WHERE id=" + id + "\n      ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.client.shutdown()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        wlogger.error("Error in cassandra-db/updateUser()", err_3);
                        throw err_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Read users and print to console
    UserDB.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        wlogger.silly("Enteried cassandra-db/deleteUser()");
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.client.execute("\n        DELETE FROM users WHERE id=" + id + "\n      ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.client.shutdown()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _a.sent();
                        wlogger.error("Error in cassandra-db/deleteUser()", err_4);
                        throw err_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return UserDB;
}());
module.exports = UserDB;
