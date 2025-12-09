const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * 비밀번호 해싱
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호 검증
 */
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
