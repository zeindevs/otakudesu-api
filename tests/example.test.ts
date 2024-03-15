import OtakudesuApi from '../src'

;(async () => {
  console.time()
  const api = new OtakudesuApi()

  const ongoing = await api.ongoing(3)
  console.info(ongoing)

  const complete = await api.complete(54)
  console.info(complete)

  const detail = await api.detail('/anime/shaman-king-flowers-sub-indo/')
  console.info(detail)

  const video = await api.video('/episode/skflower-episode-10-sub-indo/')
  console.info(video['mirror']['360p'])

  const genres = await api.genres()
  console.info(genres)

  const list = await api.list()
  console.info(list)
  console.info(list['data']["A"])

  const genre = await api.genres('/genres/vampire/')
  console.info(genre)
  console.info(genre['data'][0]['genre'])

  const nonce = await api.sendPayload('/episode/skflower-episode-10-sub-indo/', {
   action: 'aa1208d27f29ca340c92c66d1926f13f',
  })
  console.info(`nonce: ${nonce}`)

  const mirror = await api.sendPayload('/episode/skflower-episode-10-sub-indo/', {
   nonce,
   action: '2a3505c93b0035d3f455df82bf976b84',
   id: 157812,
   i: 3,
   q: '360p',
  })
  console.log(mirror)
  console.timeEnd()
})()
