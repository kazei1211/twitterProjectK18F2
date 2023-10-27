import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    //handle errorObject
    for (const key in errorObject) {
      //get message from each error
      const { msg } = errorObject[key]
      //if the message is ErrorWithStatus and the status !== 422 then throw it to the main error handler
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      //store every 422 error in the entityError
      entityError.errors[key] = msg
    }
    //here the fucntion is hadeling error themselve not throw it to the main error handler
    next(entityError)
  }
}
