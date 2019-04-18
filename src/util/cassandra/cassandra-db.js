/*
  A library doing CRUD operations on a Cassandra database.
  The Cassandra DB must be already setup with a keyspace and user table.
  The software to setup Cassandra are in the 'setup' directory.

  TODO:
  -constructor needs to be updated with production settings before deployment.
*/

"use strict"

const cassandra = require("cassandra-driver")

// Application specific libraries
const wlogger = require("../winston-logging")

// Used for debugging and iterrogating JS objects.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

class UserDB {
  constructor() {
    this.client = new cassandra.Client({
      contactPoints: ["127.0.0.1"],
      localDataCenter: "datacenter1",
      keyspace: "restusers"
    })
  }

  // Create a new user
  async createUser(user) {
    try {
      wlogger.silly("Enteried cassandra-db/createUser()")

      console.log(`user data received: ${JSON.stringify(user, null, 2)}`)

      await this.client.connect()

      const data = await this.client.execute(`
      INSERT INTO users(
        id,
        email,
        pass_hash,
        bch_addr,
        first_name,
        last_name,
        display_name,
        salt
        misc
      )
      VALUES(
        uuid(),
        '${user.email}',
        '${user.passwordHash}',
        '${user.bchAddr}',
        '${user.firstName}',
        '${user.lastName}',
        '${user.displayName}',
        '${user.salt}',
        '${user.misc}'
      )
      `)

      console.log(`user data: ${JSON.stringify(data, null, 2)}`)

      await this.client.shutdown()
    } catch (err) {
      wlogger.error(`Error in cassandra-db/createUser()`, err)
      throw err
    }
  }

  // Retrieve all users from the database.
  async readAllUsers() {
    try {
      wlogger.silly("Enteried cassandra-db/readUser()")

      await this.client.connect()

      const data = await this.client.execute(`
      SELECT * FROM users
      `)

      await this.client.shutdown()

      //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
      return data.rows
    } catch (err) {
      wlogger.error(`Error in cassandra-db/readAllUsers()`, err)
      throw err
    }
  }

  // update user data
  // TODO: Not yet working.
  async updateUser(id) {
    try {
      wlogger.silly("Enteried cassandra-db/updateUser()")

      await this.client.connect()

      await this.client.execute(`
        UPDATE users SET first_name='Steve'
        WHERE id=${id}
      `)

      await this.client.shutdown()
    } catch (err) {
      wlogger.error(`Error in cassandra-db/updateUser()`, err)
      throw err
    }
  }

  // Read users and print to console
  async deleteUser(id) {
    try {
      wlogger.silly("Enteried cassandra-db/deleteUser()")

      await this.client.connect()

      await this.client.execute(`
        DELETE FROM users WHERE id=${id}
      `)

      await this.client.shutdown()
    } catch (err) {
      wlogger.error(`Error in cassandra-db/deleteUser()`, err)
      throw err
    }
  }
}

module.exports = UserDB
