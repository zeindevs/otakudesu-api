import { AxiosRequestConfig } from 'axios'

export interface IPost {
  title: string
  episodes: string | number | null
  date: string
  day?: null | number | string
  rating?: null | number | string
  url: string
  image: string
}

export interface IPostData {
  data: IPost[]
  page: number
  total_page: number | null
  total: number
}
export interface IGenre {
  title: string
  url: string
  episodes?: string | number | null
  date?: string
  day?: null | number | string
  rating?: null | number | string
  image?: string
  studio?: string
  genre?: string[]
}

export interface IGenreData {
  data: IGenre[]
  page?: number
  total_page?: number | null
  total: number
}

export interface IEpisode {
  title: string
  date: string
  url: string
}

export interface IDetail {
  info: any
  episodes: IEpisode[]
}

export interface IVideo {
  key: string
  provider: string
  payload: {
    noice: {
      action: string
    }
    video: Payload
  }
}

export type TInfo =
  | 'judul'
  | 'japanese'
  | 'skor'
  | 'produser'
  | 'tipe'
  | 'status'
  | 'total_episode'
  | 'durasi'
  | 'tanggal_rilis'
  | 'studio'
  | 'genre'

export interface IInfo {
  judul?: string
  japanese?: string
  skor?: string
  produser?: string
  tipe?: string
  status?: string
  total_episode?: string
  durasi?: string
  tanggal_rilis?: string
  studio?: string
  genre?: string[] | string
}

export interface IVideoData {
  url: string
  mirror: {
    '360p': IVideo[]
    '480p': IVideo[]
    '720p': IVideo[]
  }
}

export type Payload = {
  id?: number
  i?: number
  q?: string
  nonce?: string
}

export type TFetchURL = {
  agent?: string
  axiosOptions?: AxiosRequestConfig<any>
}
