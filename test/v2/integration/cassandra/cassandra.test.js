/*
  Integration tests for the code interacting with the Cassandra database.

  TODO:
  -Add tests for updateUser() as it gets developed.
*/

"use strict"

const chai = require("chai")
const assert = chai.assert

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

// Library under test
const CassandraDB = require("../../../../src/util/cassandra/cassandra-db")
const cassandra = new CassandraDB("test")

const TestHelper = require("./cassandra-test-helper")
const testHelper = new TestHelper()

let uuid

describe("#Cassandra DB", () => {
  before(async () => {
    await testHelper.createKeyspace()
    await testHelper.createTable()
  })

  after(async () => {
    //await testHelper.deleteTable()
    await testHelper.deleteKeyspace()
  })

  describe("#createUser", () => {
    it("should create a new user", async () => {
      const user = {
        email: `test@test.com`,
        bchAddr: "abc",
        firstName: "def",
        lastName: "ghi",
        displayName: "jkl",
        salt: "mno",
        hash: "pqr",
        misc: "stu"
      }

      await cassandra.createUser(user)
    })
  })

  describe("#readAllUsers", () => {
    it("should read all the users in the database", async () => {
      const users = await cassandra.readAllUsers()
      //console.log(`users: ${util.inspect(users, null, 2)}`)

      assert.isArray(users)

      const user = users[0]
      assert.hasAllKeys(user, [
        "id",
        "bch_addr",
        "display_name",
        "email",
        "first_name",
        "hash",
        "last_name",
        "misc",
        "salt"
      ])

      assert.equal(user.bch_addr, "abc")
      assert.equal(user.hash, "pqr")
    })
  })

  describe("#lookupUser", () => {
    it("should retrieve user given email address", async () => {
      const email = "test@test.com"

      const user = await cassandra.lookupUser(email)
      //console.log(`user: ${util.inspect(user)}`)

      const uuid = user.id

      assert.hasAllKeys(user, [
        "id",
        "bch_addr",
        "display_name",
        "email",
        "first_name",
        "hash",
        "last_name",
        "misc",
        "salt"
      ])

      assert.equal(user.bch_addr, "abc")
      assert.equal(user.hash, "pqr")
    })
  })

  /*
  describe("#updateUser", () => {
    it("should update user data", async () => {

    })
  })
*/

  describe("#deleteUser", () => {
    it("should delete the user from the database", async () => {
      const email = "test@test.com"

      const user = await cassandra.lookupUser(email)

      await cassandra.deleteUser(user.id)

      assert.equal(true, true, "Executing without error is a pass.")
    })
  })
})
