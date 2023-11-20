import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'

export interface tweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mention: string[]
  medias: Media[]
}
