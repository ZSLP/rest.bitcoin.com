/*
  Unit tests for the JWT utility library.
*/

"use strict"

const chai = require("chai")
const assert = chai.assert

// Used for debugging.
const util = require("util")
util.inspect.defaultOptions = { depth: 1 }

// Libraries under test
const JWT = require("../../src/util/jwt")
const jwt = new JWT()

// Mocking data.
const { mockReq, mockRes, mockNext } = require("./mocks/express-mocks")

let req, res, next

describe("#JSON Web Token", () => {
  describe("#setPassword", () => {
    it("should add a salt and hash properties to the user object", () => {
      const user = {
        password: "test"
      }

      jwt.setPassword(user)

      //console.log(`user: ${util.inspect(user)}`)

      assert.hasAnyKeys(user, ["password", "salt", "hash"])
      assert.isString(user.salt)
      assert.isString(user.hash)
    })
  })

  describe("#validatePassword", () => {
    it("should return true when password matches", () => {
      const user = {
        password: "test",
        salt: "f53a0ffbab0cf557cbfce9f8dfc3a57a",
        hash:
          "73b3440ae001c76a8b69ebe12c618312561d2a12b8c89fdbb56c332978a8e8e289a4e344f7e87f506037239cf5d72bdf7340b91aebb7c41f4eebcabcf02c0a925edce61a846fcf2f1decd93c65a7674e28bcd3ba41885763967325ad038f0745732040986ff1666df68636b127fca9350e62be5b329476344452f36e2b182c8c462d5b42b5759ab61fbc9c81346d13ede4ecbd9b64fb716eab784f82b0485a35d92624a97e04ae86ecc346eb4f3c36b27a1476bf4d9338cd9faa5a4386c4d24fce97e0f878b90f456fe3f9aac0995e3257bd0a835d1fffc6ac9588533ff3f57ee3845c884159fe5f43a26db82ddaba22b04db09378cafee9d40358c18da9061340db57b3f77b6cddcffddb5e573855ad637cbc21b17239e9b029090edce4494610d18dc6690568ec4ef13f560d9f53944470e26bdb72d999e9c4fe900d044078f8a075c677d765ba06fa5c70e2acf5f93dd3edc16afdf5a72948a5d36b4314b42565677a58586a3546097cf1235581e714639e34948e9a7023f987cb56fdeb22936ff108a357bc7dcae1c3173543dbe354b9313301b2fb7441a17382010c661a6fba847fcdb9112c9acc2d81daf8358686578c7ca8e5133ffb333ab7a805bb12f22c70c36dc18e94fdab02561df290637629520702b489318904ab08372b93bf7c555012025ddcc33ba1a169f65df41eba7996d8f5f28917937b86ffd983783f"
      }

      const result = jwt.validatePassword(user, "test")

      assert.equal(result, true)
    })

    it("should return false when password matches", () => {
      const user = {
        password: "test",
        salt: "f53a0ffbab0cf557cbfce9f8dfc3a57a",
        hash:
          "73b3440ae001c76a8b69ebe12c618312561d2a12b8c89fdbb56c332978a8e8e289a4e344f7e87f506037239cf5d72bdf7340b91aebb7c41f4eebcabcf02c0a925edce61a846fcf2f1decd93c65a7674e28bcd3ba41885763967325ad038f0745732040986ff1666df68636b127fca9350e62be5b329476344452f36e2b182c8c462d5b42b5759ab61fbc9c81346d13ede4ecbd9b64fb716eab784f82b0485a35d92624a97e04ae86ecc346eb4f3c36b27a1476bf4d9338cd9faa5a4386c4d24fce97e0f878b90f456fe3f9aac0995e3257bd0a835d1fffc6ac9588533ff3f57ee3845c884159fe5f43a26db82ddaba22b04db09378cafee9d40358c18da9061340db57b3f77b6cddcffddb5e573855ad637cbc21b17239e9b029090edce4494610d18dc6690568ec4ef13f560d9f53944470e26bdb72d999e9c4fe900d044078f8a075c677d765ba06fa5c70e2acf5f93dd3edc16afdf5a72948a5d36b4314b42565677a58586a3546097cf1235581e714639e34948e9a7023f987cb56fdeb22936ff108a357bc7dcae1c3173543dbe354b9313301b2fb7441a17382010c661a6fba847fcdb9112c9acc2d81daf8358686578c7ca8e5133ffb333ab7a805bb12f22c70c36dc18e94fdab02561df290637629520702b489318904ab08372b93bf7c555012025ddcc33ba1a169f65df41eba7996d8f5f28917937b86ffd983783f"
      }

      const result = jwt.validatePassword(user, "wrongPassword")

      assert.equal(result, false)
    })
  })

  describe("#generateJWT", () => {
    it("should generate a JWT token given a user object", () => {
      const user = {
        email: `tester@email.com`,
        id: "abc123"
      }

      const newJwt = jwt.generateJWT(user)
      //console.log(`newJwt: ${util.inspect(newJwt)}`)

      assert.isString(newJwt)
    })
  })

  describe("#toAuthJSON", () => {
    it("should return a JSON object with a JWT token included", () => {
      const user = {
        email: `tester@email.com`,
        id: "abc123"
      }

      const retObj = jwt.toAuthJSON(user)
      //console.log(`retObj: ${util.inspect(retObj)}`)

      assert.hasAnyKeys(retObj, ["id", "email", "token"])
      assert.isString(retObj.id)
      assert.isString(retObj.token)
    })
  })
})
