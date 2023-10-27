// pretend i am a route '/login'
// so the userd will send you email and password
// then i will create 1 req has a body consists of email and password
import exp from 'constants'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { USERS_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/user.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'

// i will crearte an middlewares checking if the emial and password is being sent
export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
      },
      custom: {
        options: async (value, { req }) => {
          //  base on the email and password i will check if the user is exist
          const user = await databaseService.users.findOne({
            email: value,
            password: hashPassword(req.body.password)
          })
          if (user === null) {
            throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT)
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
      },
      trim: true
      // ,isLength: {
      //   options: { min: 8, max: 100 },
      //   errorMessage: USERS_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
      // },
      // isStrongPassword: {
      //   options: {
      //     minLength: 8,
      //     minLowercase: 1,
      //     minUppercase: 1,
      //     minNumbers: 1,
      //     minSymbols: 1
      //   },
      //   errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
      // }
    }
  })
)
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: USERS_MESSAGE.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
      },
      trim: true,
      isEmail: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
      },
      custom: {
        options: async (value, { req }) => {
          const isExists = await usersService.checkEmailExists(value)
          if (isExists) {
            throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
      },
      isString: true,
      isLength: {
        options: { min: 8, max: 100 },
        errorMessage: USERS_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 8, max: 100 },
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: { strict: true, strictSeparator: true }
      },
      errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_BE_ISO8601
    }
  })
)
