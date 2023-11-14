import express, { NextFunction } from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/files'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { MongoClient } from 'mongodb'
config()
initFolder()

const router = express.Router()
const app = express()
const PORT = process.env.PORT || 4000
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshToken()
  databaseService.indexFollowers()
})
app.use(express.json())
//route localhost:3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//fun demo
// const mgclient = new MongoClient(
//   `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweetprojectk18f2.xnj8wxp.mongodb.net/?retryWrites=true&w=majority`
// )

// //try cập vào db earth
// const db_earth = mgclient.db('earth')
// //truy cap65 vào collection users
// const users = db_earth.collection('users')

// //tạo giả 1000 user
// function getRandomAge() {
//   return Math.floor(Math.random() * 100) + 1
// }

// const usersData = []
// for (let i = 0; i < 1000; i++) {
//   usersData.push({
//     name: `user ${i + 1}`,
//     age: getRandomAge(),
//     sex: i % 2 == 0 ? 'male' : 'female'
//   })
// }

// //nhét mảng vào database
// users.insertMany(usersData)
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
