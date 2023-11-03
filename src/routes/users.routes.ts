import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  resendEmailVerifyTokenController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'

const usersRouter = Router()

// des: login user
// path: /users/login
// method: GET
// body: {
//   "email": string
//   "password": string
// }

usersRouter.get('/login', loginValidator, wrapAsync(loginController))

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
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

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
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

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
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
description: resend email verify token
when the email is lost or email verify token is expired, user can resend the email verify token
method: post 
path: /users/resend-email-verify-token
headers: {Authorization: Bearer ${access_token} // user have to login first to get the access token
body: {}
*/
usersRouter.post('/resend-email-verify-token', accessTokenValidator, wrapAsync(resendEmailVerifyTokenController))

/*
description: forgot password, the user sendd the email request to reset password
we will send them the forgot_password_token to their email
path: /users/forgot-password
method: post
body: {email: string}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: user enter the lnk fo rrreset password
they wil send a rewuqest with the forgot_password_token and new password
sever will check the forgot_password_token is valid or not
if valid, sever will direect to chang password page update the user with that user_id and set password = new password
path: /users/reset-password
method: post
body: {forgot_password_token: string}
*/

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

// des: user enter the lnk fo rrreset password
// they wil send a rewuqest with the forgot_password_token and new password
// sever will check the forgot_password_token is valid or not
// if valid, sever will direect to chang password page update the user with that user_id and set password = new password
// path: /users/reset-password
// method: post
// body: {forgot_password_token: string}
//
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
 */
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)
//truyền khác key là nó báo lỗi ngay

//get profile
usersRouter.get('/:username', wrapAsync(getProfileController))
export default usersRouter
