/*
  A tiny node app that uses the POST /user/ endpoint to create a new user.
*/

"use strict"

const axios = require("axios")

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

const SERVER = `http://localhost:3000/v2/`

async function createUser() {
  try {
    const user = {
      email: "test@test.com",
      password: "testpassword"
    }

    const options = {
      method: "POST",
      url: `${SERVER}user/`,
      data: { user }
    }

    const result = await axios(options)
    //console.log(`result.data: ${util.inspect(result.data)}`)

    if (result.data.success)
      console.log(`User ${user.email} successfully created.`)
    else console.log(`User was not created.`)
  } catch (err) {
    console.error(`Error in create-user.js: `, err)
  }
}
createUser()
