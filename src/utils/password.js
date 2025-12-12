import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

