import { createHash } from 'crypto'
import { config } from 'dotenv'
config()

//create a function receiving a string is encoded by sha256
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
