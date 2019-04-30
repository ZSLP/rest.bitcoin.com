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
  constructor(keyspace) {
    let thisKeyspace = keyspace
    if (!keyspace || keyspace === "") thisKeyspace = "restusers"

    this.client = new cassandra.Client({
      contactPoints: ["127.0.0.1"],
      localDataCenter: "datacenter1",
      keyspace: thisKeyspace
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
        bch_addr,
        first_name,
        last_name,
        display_name,
        salt,
        hash,
        misc
      )
      VALUES(
        uuid(),
        '${user.email}',
        '${user.bchAddr}',
        '${user.firstName}',
        '${user.lastName}',
        '${user.displayName}',
        '${user.salt}',
        '${user.hash}',
        '${user.misc}'
      )
      `)

      //console.log(`user data: ${JSON.stringify(data, null, 2)}`)
    } catch (err) {
      wlogger.error(`Error in cassandra-db/createUser().`)
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

      //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
      return data.rows
    } catch (err) {
      wlogger.error(`Error in cassandra-db/readAllUsers()`, err)
      throw err
    }
  }

  // lookup a user by email
  async findByEmail(email) {
    try {
      wlogger.silly("Enteried cassandra-db/findByEmail()")

      await this.client.connect()

      const data = await this.client.execute(`
        SELECT * FROM users WHERE email='${email}'
      `)

      //await this.client.shutdown()

      //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
      return data.rows[0]
    } catch (err) {
      wlogger.error(`Error in cassandra-db/findByEmail()`)
      throw err
    }
  }

  // lookup a user by email
  async findByBchAddr(bchAddr) {
    try {
      wlogger.silly("Enteried cassandra-db/findByBchAddr()")

      await this.client.connect()

      const data = await this.client.execute(`
        SELECT * FROM users WHERE bch_addr='${bchAddr}'
      `)

      //await this.client.shutdown()

      //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
      return data.rows[0]
    } catch (err) {
      wlogger.error(`Error in cassandra-db/findByBchAddr()`)
      throw err
    }
  }

  async findById(id) {
    try {
      wlogger.silly("Enteried cassandra-db/findById()")

      await this.client.connect()

      const data = await this.client.execute(`
        SELECT * FROM users WHERE id=${id}
      `)

      //await this.client.shutdown()

      //console.log(`users: ${JSON.stringify(data.rows, null, 2)}`)
      return data.rows[0]
    } catch (err) {
      wlogger.error(`Error in cassandra-db/findById()`)
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

      //await this.client.shutdown()
    } catch (err) {
      wlogger.error(`Error in cassandra-db/updateUser()`, err)
      throw err
    }
  }

  // Delete users from the DB.
  async deleteUser(id) {
    try {
      wlogger.silly("Enteried cassandra-db/deleteUser()")

      await this.client.connect()

      await this.client.execute(`
        DELETE FROM users WHERE id=${id}
      `)

      //await this.client.shutdown()
    } catch (err) {
      wlogger.error(`Error in cassandra-db/deleteUser()`, err)
      throw err
    }
  }
}

module.exports = UserDB
