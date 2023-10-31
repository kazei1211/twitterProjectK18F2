import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGE } from '~/constants/messages'

class UsersService {
  //fucntion to get user is and put into payload to create an access token
  private signAccessToken(user_id: string) {
    return signToken({
      payLoad: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  // email sign verify token fucntion
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payLoad: { user_id, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  //forgot password token function
  private signForgotPasswordVerifyToken(user_id: string) {
    return signToken({
      payLoad: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  //function này để lấy id của user và đưa vào payload để tạo ra refresh token

  private signRefreshToken(user_id: string) {
    return signToken({
      payLoad: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  //  signRefreshToken(user_id: string) and signAccessToken(user_id: string) are private functions that are used to sign refresh token and access token respectively. Both functions take user_id as an argument and return a token. The difference between the two functions is that signRefreshToken() returns a refresh token and signAccessToken() returns an access token.
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async register(payLoad: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await databaseService.users.insertOne(
      new User({
        ...payLoad,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payLoad.date_of_birth),
        password: hashPassword(payLoad.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())
    //save refresh token to db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    console.log(email_verify_token)
    return { access_token, refresh_token }
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return { access_token, refresh_token }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGE.LOGOUT_SUCCESS }
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { verify: UserVerifyStatus.Verified, email_verify_token: '', update_at: '$$NOW' } }
    ])
    //create new access token and refresh token
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    //save refresh token to db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    //udate user with that user_id and set email_verify_token = email_verify_token
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, update_at: '$$NOW' } }
    ])
    //simulate sending email
    console.log(email_verify_token)
    return { message: USERS_MESSAGE.RESEND_EMAIL_VERIFY_SUCCESS }
  }

  async forgotPassword(user_id: string) {
    //create forgot password token
    const forgot_password_token = await this.signForgotPasswordVerifyToken(user_id)
    //update user with that user_id and set forgot_password_token = forgot_password_token
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { forgot_password_token, update_at: '$$NOW' } }
    ])
    //simulate sending email
    console.log(forgot_password_token)
    return { message: USERS_MESSAGE.CHECK_EMAIL_FOR_RESET_PASSWORD }
  }
}

const usersService = new UsersService()
export default usersService
