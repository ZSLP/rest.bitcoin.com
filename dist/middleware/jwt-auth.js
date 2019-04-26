/*
  This middleware inspects the request header for a JWT token.
  Will populate req.user with information from the JWT token.
*/
"use strict";
var jwt = require("express-jwt");
var getTokenFromHeaders = function (req) {
    //console.log(`Searching headers for a JWT token.`)
    var authorization = req.headers.authorization;
    if (authorization && authorization.split(" ")[0] === "Token") {
        //console.log(`JWT found.`)
        return authorization.split(" ")[1];
    }
    //console.log(`JWT not found.`)
    return null;
};
var jwtAuth = {
    required: jwt({
        secret: "secret",
        userProperty: "payload",
        getToken: getTokenFromHeaders
    }),
    optional: jwt({
        secret: "secret",
        userProperty: "payload",
        getToken: getTokenFromHeaders,
        credentialsRequired: false
    })
};
module.exports = jwtAuth;
