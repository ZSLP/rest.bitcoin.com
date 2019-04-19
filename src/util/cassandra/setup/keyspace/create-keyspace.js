/*
  Create the 'restusers' keyspace.
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

    const query = `CREATE KEYSPACE restusers WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1}`
    await client.execute(query)
    console.log(`Keyspace 'restusers' created`)

    await client.shutdown()
    console.log("Disconnected from database.")
  } catch (err) {
    console.error(err)
  }
}
createDB()
