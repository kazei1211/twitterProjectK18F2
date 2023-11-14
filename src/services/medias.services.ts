import { Request } from 'express'
import { getNameFromFullname, handelUploadImage, handelUploadVideo } from '~/utils/files'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Others'
import { MediaType } from '~/constants/enums'

class MediasServices {
  async uploadImage(req: Request) {
    const files = await handelUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFromFullname(file.newFilename) + '.jpg'
        const newFilePath = UPLOAD_IMAGE_DIR + '/' + newFileName
        const info = await sharp(file.filepath).jpeg().toFile(newFilePath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image${newFileName}`
            : `http://localhost:${process.env.PORT}/static/image/${newFileName}`,
          type: MediaType.image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handelUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const { newFilename } = file
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-stream${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video-stream/${newFilename}`,
          type: MediaType.image
        }
      })
    )
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
