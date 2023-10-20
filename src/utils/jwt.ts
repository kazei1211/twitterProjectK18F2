import jwt from 'jsonwebtoken'

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
