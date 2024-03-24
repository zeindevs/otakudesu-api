import { describe, it, expect } from '@jest/globals'
import OtakudesuApi from '../dist'

const api = new OtakudesuApi('https://otakudesu.cloud')

describe('API test', () => {
  it('should be can fetch ongoing anime', async () => {
    const ongoing = await api.ongoing(3)
    expect(ongoing).not.toBe(null)
  })

  it('should be can fetch complete anime', async () => {
    const complete = await api.complete(54)
    expect(complete).not.toBe(null)
  })

  it('should be can fetch detail anime', async () => {
    const detail = await api.detail('/anime/shaman-king-flowers-sub-indo/')
    expect(detail).not.toBe(null)
  })

  it('should be can fetch video', async () => {
    const video = await api.video('/episode/skflower-episode-10-sub-indo/')
    expect(video).not.toBe(null)
    expect(video['mirror']).not.toBe(null)
    expect(video['downloads']).not.toBe(null)
  })

  it('should be can fetch genres', async () => {
    const genres = await api.genres()
    expect(genres).not.toBe(null)
  })

  it('should be can fetch anime list', async () => {
    const list = await api.list()
    expect(list).not.toBe(null)
    expect(list['data']['A']).not.toBe(null)
  })

  it('should be can fetch anime by genres', async () => {
    const genre = await api.genres('/genres/vampire/')
    expect(genre).not.toBe(null)
    expect(genre['data'][0]['genre']).not.toBe(null)
  })

  it('should be can search anime', async () => {
    const search = await api.search('Solo Leveling')
    expect(search).not.toBe(null)
    expect(search['data'].length).not.toBe(0)
  })

  it('should be can send payload', async () => {
    const nonce = await api.sendPayload('/episode/skflower-episode-10-sub-indo/', {
      action: 'aa1208d27f29ca340c92c66d1926f13f',
    })
    expect(nonce).not.toBe(null)

    const mirror = await api.sendPayload('/episode/skflower-episode-10-sub-indo/', {
      nonce,
      action: '2a3505c93b0035d3f455df82bf976b84',
      id: 157812,
      i: 3,
      q: '360p',
    })
    expect(mirror).not.toBe(null)
  })
})
