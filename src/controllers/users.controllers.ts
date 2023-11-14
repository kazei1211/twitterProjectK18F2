import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EmailVerifyRequestBody,
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  refreshTokenReqBody
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
  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify
  })

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

export const forgotPasswordController = async (req: Request, res: Response) => {
  //after the email is validated, get user_id form th requets
  const { _id, verify } = req.user as User
  //use _id to find and updat user with forgot_password_token
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify
  })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  //if they want to reset password, we need user_id and the new password
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  //use _id to find and updat user with password
  const { password } = req.body
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  //if u want to get user profile, u need to get user_id firsr
  const { user_id } = req.decoded_authorization as TokenPayload
  //use user_id to find user
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGE.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGE.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params //lấy username từ query params
  const result = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGE.GET_PROFILE_SUCCESS, //message.ts thêm  GET_PROFILE_SUCCESS: 'Get profile success',
    result
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unFollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unfollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}

export const refreshTokenConroller = async (
  req: Request<ParamsDictionary, any, refreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token })
  return res.json({
    message: USERS_MESSAGE.REFRESH_SUCCESS,
    result
  })
}

export const oAuthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  const { access_token, refresh_token, new_user } = await usersService.oAuth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}`
  return res.redirect(urlRedirect)
}
