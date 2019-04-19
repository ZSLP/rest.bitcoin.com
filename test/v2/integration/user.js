/*
  Integration tests for the user/ routes.
  These tests will eventually be converted to unit tests.
*/

"use strict"

const chai = require("chai")
const assert = chai.assert
const axios = require("axios")

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

//const SERVER = `https://rest.btctest.net/v2/`
const SERVER = `http://localhost:3000/v2/`

describe("#user", () => {
  describe("#create user", () => {
    it("should throw error if no body data is provided.", async () => {
      try {
        const options = {
          method: "POST",
          url: `${SERVER}user/createUser`
        }

        const result = await axios(options)

        assert.equal(true, false, "Unexpected result")
      } catch (err) {
        //console.log(`err: ${util.inspect(err)}`)
        assert.equal(err.response.status, 422)
      }
    })

    it("should throw error if email is not supplied", async () => {
      try {
        const user = {
          password: "testpassword"
        }

        const options = {
          method: "POST",
          url: `${SERVER}user/createUser`,
          data: { user }
        }

        const result = await axios(options)
        //console.log(`result.data: ${util.inspect(result.data)}`)

        assert.equal(true, false, "Unexpected result")
      } catch (err) {
        //console.log(`err: ${util.inspect(err)}`)
        assert.equal(err.response.status, 422)
      }
    })

    it("should throw error if password is not supplied", async () => {
      try {
        const user = {
          email: "test@test.com"
        }

        const options = {
          method: "POST",
          url: `${SERVER}user/createUser`,
          data: { user }
        }

        const result = await axios(options)
        //console.log(`result.data: ${util.inspect(result.data)}`)

        assert.equal(true, false, "Unexpected result")
      } catch (err) {
        //console.log(`err: ${util.inspect(err)}`)
        assert.equal(err.response.status, 422)
      }
    })

    it("should create a new user", async () => {
      const user = {
        email: "test@test.com",
        password: "testpassword"
      }

      const options = {
        method: "POST",
        url: `${SERVER}user/createUser`,
        data: { user }
      }

      const result = await axios(options)
      //console.log(`result.data: ${util.inspect(result.data)}`)

      assert.hasAllKeys(result.data, ["success"])
      assert.equal(result.data.success, true)
    })
  })
})
