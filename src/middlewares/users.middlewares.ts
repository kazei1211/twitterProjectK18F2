// pretend i am a route '/login'
// so the userd will send you email and password
// then i will create 1 req has a body consists of email and password

import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/user.services'
import { validate } from '~/utils/validation'

// i will crearte an middlewares checking if the emial and password is being sent
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      errorMessage: 'Name is not valid'
    },
    email: {
      notEmpty: true,
      isString: true,
      trim: true,
      isEmail: true,
      custom: {
        options: async (value, { req }) => {
          const isExists = await usersService.checkEmailExists(value)
          if (isExists) {
            throw new Error('Email already exists')
          }
        }
      },
      errorMessage: 'Email is not valid'
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 8, max: 100 }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: 'Password is not valid'
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 8, max: 100 }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: 'Confirm password must be the same as password',
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Confirm password must be the same as password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: { strict: true, strictSeparator: true }
      },
      errorMessage: 'Date of birth is not valid'
    }
  })
)
