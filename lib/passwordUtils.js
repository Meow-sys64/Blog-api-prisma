const bcrypt = require('bcrypt');
const saltRounds = 10;

async function genHash(plainText){
  let generatedHash = await bcrypt.hash(plainText, saltRounds);
  return generatedHash
}

function validateHash(plainText, hash){
  const isValid = bcrypt.compareSync(plainText, hash)
  return isValid
}

module.exports.validateHash = validateHash;
module.exports.genHash = genHash;

