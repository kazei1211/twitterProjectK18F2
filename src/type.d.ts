//this file is use for dredeclare thr Req post from client
import { Request } from 'express'
import { TokenPayload } from './models/requests/User.request'

declare module 'express' {
  interface Request {
    user?: any
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
