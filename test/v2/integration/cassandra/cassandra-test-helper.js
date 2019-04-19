/*
  This library helps the testing library by setting up and tearring down a
  test keyspace and test table for running tests against.
*/

"use strict"

const cassandra = require("cassandra-driver")

class CassandraTestHelper {
  constructor() {
    //Connect to the cluster
    this.client = new cassandra.Client({
      contactPoints: ["127.0.0.1"],
      localDataCenter: "datacenter1"
    })
  }

  async createKeyspace() {
    try {
      await this.client.connect()
      //console.log("connected to database.")

      const query = `CREATE KEYSPACE test WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1}`
      await this.client.execute(query)
      //console.log(`Keyspace 'test' created`)
    } catch (err) {
      console.error(`Error in cassandra-test-helper.js/createKeyspace().`)
      throw err
    }
  }

  async deleteKeyspace() {
    try {
      await this.client.connect()
      //console.log("connected to database.")

      const query = `DROP KEYSPACE test`
      await this.client.execute(query)
      //console.log(`Keyspace 'test' deleted`)
    } catch (err) {
      console.error(`Error in cassandra-test-helper.js/deleteKeyspace().`)
      throw err
    }
  }

  // Create a table for tests to run against
  async createTable() {
    await this.client.connect()
    //console.log(`Connect to database and keyspace 'test'.`)

    // Create users table
    await client.execute(`
      CREATE TABLE users(
        id uuid PRIMARY KEY,
        email text,
        bch_addr text,
        first_name text,
        last_name text,
        display_name text,
        salt text,
        hash text,
        misc text
      )
      `)

    // Create index on the email column, to allow email look-up of users.
    await client.execute(`
        CREATE INDEX ON users(email)
      `)
  }

  // Delete the users table.
  async deleteTable() {
    await this.client.connect()

    // Delete the table.
    await client.execute(`
      DROP TABLE users
      `)
  }
}

module.exports = CassandraTestHelper
