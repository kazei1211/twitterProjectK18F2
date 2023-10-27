import { RequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //create try catch block
    try {
      //call func(req, res, next)
      await func(req, res, next)
    } catch (err) {
      //pass err to next
      next(err)
    }
  }
}
