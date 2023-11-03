import { RequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'

export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
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
