const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');

const pathToKey = path.join(__dirname, '../keypairs', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

module.exports = {
  async genHash(plainText) {
    let generatedHash = await bcrypt.hash(plainText, saltRounds);
    return generatedHash
  },

  validateHash(plainText, hash) {
    const isValid = bcrypt.compareSync(plainText, hash)
    return isValid
  },
  issueJWT(user) {
    const _id = user.id;
    const expiresIn = "1d";
    const payload = {
      sub: _id,
      iat: Date.now(),
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
      expiresIn: expiresIn,
      algorithm: "RS256",
    });

    return {
      token: "Bearer " + signedToken,
      expires: expiresIn,
    };
  }
}
