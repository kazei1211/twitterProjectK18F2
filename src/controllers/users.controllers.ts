import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EmailVerifyRequestBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/User.request'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGE } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Verify } from 'crypto'
import { UserVerifyStatus } from '~/constants/enums'
import { read } from 'fs'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //get user from req
  const user = req.user as User
  const user_id = user._id as ObjectId

  // use user to create access token and refresh token
  const result = await usersService.login(user_id.toString())

  //res access token and refresh token
  res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGE.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const refresh_token = req.body.refresh_token
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody>,
  res: Response
) => {
  //if the code reach here that mean the email_verify_token is valid and we got the decoded_email_verify_token from the middleware
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  //base on the user_id, we check the user has validated orr not and then update the user with that user_id and set verified = true, email_verify_token = ''
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  //if the the verify cation token is not match
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.INVALID_EMAIL_VERIFY_TOKEN,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //if the user is already verified, we return the message
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGE.USER_ALREADY_VERIFIED
    })
  }

  //if reach here, that mean the user is not verified yet, we update the user with that user_id and set verified = true, email_verify_token = ''
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyTokenController = async (req: Request, res: Response) => {
  //if reach here then the access token is valid and we got the decoded_access_token from the middleware
  const { user_id } = req.decoded_authorization as TokenPayload
  //check if the user has verified or not
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGE.USER_ALREADY_VERIFIED
    })
  }

  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN //403
    })
  }
  //if reach here, thet mean the user not verified yet, we recrate verify token and
  // update the user with that user_id and set verified = true, email_verify_token = ''
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}
