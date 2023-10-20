import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'gofuckyourself@gmail.com' && password === 'ok') {
    return res.json({
      message: 'Login sucessfull!',
      result: [
        { name: 'Nguyen', yob: 2003 },
        { name: 'Pham', yob: 2003 },
        { name: 'Pham Nguyen', yob: 2003 }
      ]
    })
  } else {
    return res.status(401).json({
      error: 'Go away you suck, BLYAT'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    res.json({
      message: 'Regitered successfully',
      result
    })
  } catch (err) {
    res.status(400).json({
      message: 'resister failed',
      err
    })
  }
}
