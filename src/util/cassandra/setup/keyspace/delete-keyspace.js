/*
  Delete the 'restusers' keyspace.
*/

"use strict"

const cassandra = require("cassandra-driver")

//Connect to the cluster
var client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1"
})

async function createDB() {
  try {
    await client.connect()
    console.log("connected to database.")

    const query = `DROP KEYSPACE restusers`
    await client.execute(query)
    console.log(`Keyspace 'restusers' deleted`)

    await client.shutdown()
    console.log("Disconnected from database.")
  } catch (err) {
    console.error(err)
  }
}
createDB()
