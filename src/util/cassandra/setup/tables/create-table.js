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
      pass_hash text,
      bch_addr text,
      first_name text,
      last_name text,
      display_name text,
      misc text
    )
    `)
  console.log(`table created`)

  await client.shutdown()
  console.log("Disconnected from database.")
}
createTable()
