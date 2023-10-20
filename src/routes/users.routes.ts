import { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
const usersRoute = Router()

usersRoute.get('/login', loginValidator, loginController)

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
usersRoute.post('/register', registerValidator, registerController)

export default usersRoute
