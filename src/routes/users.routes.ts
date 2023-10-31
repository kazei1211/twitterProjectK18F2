import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  resendEmailVerifyTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator
} from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

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

/*
Description: verify email token,
when user register, they will recieve an email with a link: http://localhost:3000/users/verify-email?token=<email_verify_token> to verify their email
if they click the link, it will create a req with this token and send to sever 
check if the token is valid,
form decoded_authorization, we can get user_id and then update the user with that user_id token = '' verified = true, update at = new Date()
path: /users/verify-email
method: Post
body: {email_verify_token: string}
*/
usersRoute.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))
/*
description: resend email verify token
when the email is lost or email verify token is expired, user can resend the email verify token
method: post 
path: /users/resend-email-verify-token
headers: {Authorization: Bearer ${access_token} // user have to login first to get the access token
body: {}
*/

usersRoute.post('/resend-email-verify-token', accessTokenValidator, wrapAsync(resendEmailVerifyTokenController))
export default usersRoute
