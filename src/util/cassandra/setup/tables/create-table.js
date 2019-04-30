/*
  Create the users table
*/

"use strict"

const cassandra = require("cassandra-driver")

// Used for debugging and iterrogating JS objects.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

//Connect to the cluster
var client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "restusers"
})

// Read users and print to console
async function createTable() {
  await client.connect()
  console.log(`Connect to database and keyspace 'restusers'.`)

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
  console.log(`users table created.`)

  await client.execute(`
      CREATE INDEX ON users(email)
    `)
  console.log(`Index created on email column of users table.`)

  await client.execute(`
      CREATE INDEX ON users(bch_addr)
    `)
  console.log(`Index created on bch_addr column of users table.`)

  await client.shutdown()
  console.log("Disconnected from database.")
}
createTable()
