import { Router } from 'express'
import { loginController, logoutController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, refreshTokenValidator } from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
const usersRoute = Router()

// des: login user
// path: /users/login
// method: GET
// body: {
//   "email": string
//   "password": string
// }

usersRoute.get('/login', loginValidator, wrapAsync(loginController))

/*
Description: resiter new user
Path: /register
Method: POST
Bpdy:{
  "name": string
  "email": string
  "password": string
  "confirm_password": string
  "date_of_birth": string following ISO 8601 standard (YYYY-MM-DD)
}
*/
usersRoute.post('/register', registerValidator, wrapAsync(registerController))

/*
description: logout user
path: /users/logout
method: POST
body: {
  "refresh_token": string
  headers: {Authorization: Bearer ${access_token}
  body: {refresh_token: string}
}
 */
usersRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
export default usersRoute
