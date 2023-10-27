//this file is use for dredeclare thr Req post from client
import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: any
  }
}
