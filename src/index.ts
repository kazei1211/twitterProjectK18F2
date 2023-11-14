import express, { NextFunction } from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/files'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()
initFolder()

const router = express.Router()
const app = express()
const PORT = process.env.PORT || 4000
databaseService.connect()
app.use(express.json())
//route localhost:3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//fun demo

//fun demo
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
// app.use('/static', express.static(UPLOAD_DIR))
//localhost:3000/users/tweets

// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
