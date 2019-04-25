/*
  A tiny node app that uses the POST /user/ endpoint to create a new user.
*/

"use strict"

const axios = require("axios")

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

const SERVER = `http://localhost:3000/v2/`

async function getJWT() {
  try {
    const user = {
      email: "test@test.com",
      password: "testpassword"
    }

    const options = {
      method: "POST",
      url: `${SERVER}user/login`,
      data: { user }
    }

    const result = await axios(options)
    //console.log(`result.data: ${util.inspect(result.data)}`)

    if (result.data.user.token) {
      console.log(`JWT token: ${result.data.user.token}`)
    } else {
      console.log(
        `Unexpected value returned. data: ${JSON.stringify(
          result.data,
          null,
          2
        )}`
      )
    }
  } catch (err) {
    console.error(`Error in create-user.js: `, err)
  }
}
getJWT()
