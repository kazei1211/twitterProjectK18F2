import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGE } from '~/constants/messages'
export const loginController = async (req: Request, res: Response) => {
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
