"use strict"

const mongoose = require("mongoose")

const User = require("../../../../src/models/users")

async function getUsers() {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set("useCreateIndex", true) // Stop deprecation warning.
  await mongoose.connect("mongodb://localhost:27017/pro-auth", {
    useMongoClient: true
  })

  const users = await User.find({}, "-password")
  console.log(`users: ${JSON.stringify(users, null, 2)}`)

  mongoose.connection.close()
}
getUsers()
