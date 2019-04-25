/*
  A tiny node app that uses the POST /user/ endpoint to create a new user.
*/

"use strict"

const axios = require("axios")

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

const SERVER = `http://localhost:3000/v2/`

const jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjQzYWFmMmNkLWU5MDktNDA5ZS05OWYzLTY4M2QyYWQ3ZDZiMiIsImV4cCI6MTU1ODU1MTY5MiwiaWF0IjoxNTU1OTU5NjkyfQ.nm-EATbpfNxTWLh5DzJ_rQxVgropEwhyVwQzGOUHYbA`

async function deleteUser() {
  try {
    const options = {
      method: "POST",
      url: `${SERVER}user/delete`,
      headers: { Authorization: `Token ${jwtToken}` }
    }

    const result = await axios(options)
    //console.log(`result.data: ${util.inspect(result.data)}`)

    if (result.data.success) console.log(`User successfully deleted.`)
    else
      console.log(`User not deleted: ${JSON.stringify(result.data, null, 2)}`)
  } catch (err) {
    //console.error(`Error in create-user.js: `, err)
    console.log(
      `User not deleted: ${JSON.stringify(err.response.data, null, 2)}`
    )
  }
}
deleteUser()
