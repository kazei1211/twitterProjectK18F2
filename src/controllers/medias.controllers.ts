import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import mediasServices from '~/services/medias.services'
import mime from 'mime'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasServices.uploadImage(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasServices.uploadVideo(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_VIDEO_SUCCESSFULLY,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { namefile } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, namefile), (error) => {
    if (error) {
      res.status((error as any).status).send(USERS_MESSAGE.IMAGE_NOT_FOUND)
    }
  })
}

export const serveVideoController = (req: Request, res: Response) => {
  const { namefile } = req.params
  const range = req.headers.range

  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, namefile)
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
