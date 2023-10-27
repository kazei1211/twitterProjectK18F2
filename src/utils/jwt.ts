import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.request'

//make a function to get payload, privatekey, option and then sign it
export const signToken = ({
  payLoad,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payLoad: string | object | Buffer
  privateKey?: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payLoad, privateKey, options, (err, token) => {
      if (err) return reject(err)
      return resolve(token as string)
    })
  })
}

//function to get token and secretOrPublicKey verify it
export const verifyToken = ({
  token,
  secreteOrPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secreteOrPublicKey?: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secreteOrPublicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
