/**
 * Copyright 2024 zeindevs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import * as Cheerio from 'cheerio'

import { OtakudesuConfig as config } from './config'
import {
	IAnimeList,
	IDetail,
	IDownload,
	IEpisode,
	IGenre,
	IGenreData,
	IAnimeListItem,
	IAnimeListData,
	IInfo,
	IPost,
	IPostData,
	IVideo,
	IVideoData,
	Payload,
	TFetchURL,
	TFilterDownload,
	TInfo,
	TVideoFormat,
} from './types'

export default class OtakudesuApi {
	constructor(
		private baseURL: string = 'https://otakudesu.cloud',
		private AxiosOts?: AxiosRequestConfig,
	) {
		this.AxiosOts = AxiosOts
	}

	/**
	 * Create header request
	 *
	 * @param agent User agent
	 * @param options Axios request config
	 * @returns
	 * */
	private makeHeaders = (agent: string = config.UA_WINDOWS, options?: AxiosRequestConfig): any => {
		return {
			'user-agent': agent,
			'accept-language': 'en-US,en;q=0.6',
			'cache-control': 'max-age=0',
			'if-modified-since': 'Mon, 11 Mar 2024 20:00:16 GMT',
			'sec-ch-ua': agent,
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': 'Windows',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-user': '?1',
			'sec-gpc': '1',
			'upgrade-insecure-requests': '1',
			'Referrer-Policy': 'same-origin',
			...options,
		}
	}

	/**
	 * Axios request
	 *
	 * @param url url path
	 * @param axiosOptions
	 * @returns
	 * */
	private fetchUrl = (
		url: string = '',
		{ agent = config.UA_WINDOWS, axiosOptions = {} }: TFetchURL,
	): Promise<AxiosResponse<any, any>> => {
		return axios({
			baseURL: this.baseURL,
			url,
			headers: axiosOptions.headers ? axiosOptions.headers : this.makeHeaders(agent),
			method: axiosOptions.method || 'GET',
			...axiosOptions,
			...this.AxiosOts,
		})
	}

	/**
	 * Parse post
	 *
	 * @param $ Cheerio document coming from `Cheerio.load(html)`
	 * @param elem Cheerio element
	 * @returns
	 **/
	private parsePost = ($: Cheerio.CheerioAPI, elem: Cheerio.Element): IPost => {
		return {
			title: $(elem).find('h2').text().trim(),
			episodes: parseInt($(elem).find('div.epz').text().trim()),
			date: $(elem).find('div.newnime').text().trim(),
			image: $(elem).find('img').attr('src')!,
			url: $(elem).find('a').attr('href')!,
		}
	}

	/**
	 * Convert genres to array
	 *
	 * @param genre Genre text
	 * @returns
	 **/
	private parseGenre = (genre: string): string[] => {
		let data: string[] = []
		genre
			.trim()
			.split(',')
			.forEach((x: string) => data.push(x.trim()))
		return data
	}

	/**
	 * Filter downloads
	 *
	 * @param downloads Data
	 * @param value Filter value
	 * @returns
	 * */
	private filterDownload = (downloads: IDownload[], value: TFilterDownload) => {
		return downloads.filter((x) => x.format.replace(' ', '-').toLowerCase() === value)
	}

	/**
	 * Filter mirror
	 *
	 * @param mirrors Data
	 * @param value Filter value
	 * @returns
	 * */
	private filterMirror = (mirrors: IVideo[], value: TVideoFormat) => {
		return mirrors.filter((x) => x.format === value)
	}

	/**
	 * Fetch ongoing
	 *
	 * @param page Page number
	 * @returns
	 * */
	public ongoing = async (page: number = 1): Promise<IPostData> => {
		try {
			const html = (
				await this.fetchUrl(`/ongoing-anime/page/${page}`, { agent: config.UA_WINDOWS })
			)?.data
			const $ = Cheerio.load(html)
			let data: IPost[] = []
			$('div.venz > ul > li').each((i: number, elem: Cheerio.Element) => {
				data[i] = {
					...this.parsePost($, elem),
					day: $(elem).find('div.epztipe').text().trim(),
				}
			})
			const total_page =
				parseInt(
					$('div.pagenavix > .page-numbers')
						.filter((_, el) => Number.isInteger(parseInt($(el).text())))
						.last()
						.text(),
				) || null
			return { data, page, total_page, total: data.length }
		} catch (err) {
			throw err
		}
	}

	/**
	 * Fetch complete
	 *
	 * @param page Page number
	 * @returns
	 * */
	public complete = async (page: number = 1): Promise<IPostData> => {
		try {
			const html = (
				await this.fetchUrl(`/complete-anime/page/${page}`, { agent: config.UA_WINDOWS })
			)?.data
			const $ = Cheerio.load(html)
			let data: IPost[] = []
			$('div.venz > ul > li').each((i: number, elem: Cheerio.Element) => {
				data[i] = {
					...this.parsePost($, elem),
					rating: parseFloat($(elem).find('div.epztipe').text().trim()),
				}
			})
			const total_page =
				parseInt(
					$('div.pagenavix > .page-numbers')
						.filter((_, el) => Number.isInteger(parseInt($(el).text())))
						.last()
						.text(),
				) || null
			return { data, page, total_page, total: data.length }
		} catch (err) {
			throw err
		}
	}

	/**
	 * Fetch detail
	 *
	 * @param url Url path
	 * @returns
	 * */
	public detail = async (url: string): Promise<IDetail> => {
		try {
			const html = (await this.fetchUrl(url, { agent: config.UA_WINDOWS }))?.data
			const $ = Cheerio.load(html)
			let info: IInfo = {}
			$('div.infozingle > p').each((_, elm) => {
				let [title, value] = $(elm).find('span').text().split(':')!
				let label: TInfo = title?.trim().replace(' ', '_').toLowerCase() as TInfo
				info[label] = value?.trim()
				// Convert genre to array
				if (label === 'genre') {
					info['genre'] = this.parseGenre(value!)
				}
			})
			let episodes: IEpisode[] = []
			$('div.episodelist > ul > li').each((i, elm) => {
				episodes[i] = {
					title: $(elm).find('a').text().trim(),
					url: $(elm).find('a').attr('href')!,
					date: $(elm).find('span.zeebr').text().trim(),
				}
			})
			return { info, episodes }
		} catch (err) {
			throw err
		}
	}

	/**
	 * Send payload
	 *
	 * @param url Url path
	 * @param payload Payload data
	 * @return
	 * */
	public sendPayload = async (url: string, payload: Payload & { action: string }): Promise<any> => {
		try {
			let data: URLSearchParams = payload?.nonce
				? new URLSearchParams({
					id: payload?.id!.toString(),
					i: payload?.i!.toString(),
					q: payload?.q!,
					nonce: payload?.nonce,
					action: payload?.action,
				})
				: new URLSearchParams({ action: payload?.action! })
			const response = (
				await this.fetchUrl('', {
					axiosOptions: {
						baseURL: `${this.baseURL}/wp-admin/admin-ajax.php`,
						method: 'POST',
						headers: {
							...this.makeHeaders(config.UA_WINDOWS),
							'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'x-requested-with': 'XMLHttpRequest',
							Referer: `${this.baseURL}${url}`,
						},
						data,
					},
				})
			)?.data
			return response?.data
		} catch (err) {
			if (axios.isAxiosError(err)) {
				throw new Error(err.response?.data)
			}
			throw err
		}
	}

	/**
	 * Fetch video url
	 *
	 * @param url Url path
	 * @returns
	 * */
	public video = async (url: string): Promise<IVideoData> => {
		try {
			const html = (await this.fetchUrl(url, { agent: config.UA_WINDOWS }))?.data
			const $ = Cheerio.load(html)
			let iframe = $('div#embed_holder').find('iframe').attr('src')!
			let action = html.match(/action:"([^"]*)"/g).map((match: string[]) => match.slice(8, -1))
			let videos: IVideo[] = []
			new Array('m360p', 'm480p', 'm720p').forEach((media) => {
				$('div#embed_holder > div.mirrorstream')
					.find(`ul.${media} > li`)
					.each((_, elm) => {
						let key = $(elm).find('a').attr('data-content')!
						videos.push({
							key,
							format: media as TVideoFormat,
							provider: $(elm).find('a').text().trim(),
							payload: {
								noice: { action: action[1] },
								video: { ...JSON.parse(atob(key)), action: action[0] },
							},
						})
					})
			})
			let downloads: IDownload[] = []
			$('div.download > ul').each((_, elm) => {
				$(elm)
					.find('li')
					.each((_, el) => {
						let format = $(el).find('strong').text().trim()
						let size = $(el).find('i').text().trim()
						$(el)
							.find('a')
							.each((_, e) => {
								downloads.push({
									format: format,
									title: $(e).text().trim(),
									url: $(e).attr('href')!,
									size: size,
								})
							})
					})
			})
			return {
				url: iframe,
				mirror: {
					'360p': this.filterMirror(videos, 'm360p'),
					'480p': this.filterMirror(videos, 'm480p'),
					'720p': this.filterMirror(videos, 'm720p'),
				},
				downloads: {
					'mp4-360p': this.filterDownload(downloads, 'mp4-360p'),
					'mp4-480p': this.filterDownload(downloads, 'mp4-480p'),
					'mp4-720p': this.filterDownload(downloads, 'mp4-720p'),
					'mkv-480p': this.filterDownload(downloads, 'mkv-480p'),
					'mkv-720p': this.filterDownload(downloads, 'mkv-720p'),
					'mkv-1080p': this.filterDownload(downloads, 'mkv-1080p'),
				},
			}
		} catch (err) {
			throw err
		}
	}

	/**
	 * Fetch anime list
	 *
	 * @returns
	 * */
	public list = async (): Promise<IAnimeListData> => {
		try {
			const html = (await this.fetchUrl('/anime-list/', { agent: config.UA_WINDOWS }))?.data
			const $ = Cheerio.load(html)
			let data: IAnimeList = {}
			$('div#abtext > div.bariskelom').each((_, elm) => {
				let group: IAnimeListItem[] = []
				let title = $(elm).find('div.barispenz').text().trim()
				$(elm)
					.find('div.penzbar')
					.each((i, el) => {
						let text = $(el).find('a.hodebgst')
						if (text) {
							group[i] = {
								title: text.text().trim(),
								url: text.attr('href')!,
							}
							data[title] = group
						}
					})
			})
			return { data }
		} catch (err) {
			throw err
		}
	}

	/**
	 * Fetch genres list
	 *
	 * @param genre Genre name
	 * @param page Page number
	 * @returns
	 * */
	public genres = async (genre: string = '', page: number = 1): Promise<IGenreData> => {
		try {
			const html = (
				await this.fetchUrl(genre ? `${genre}page/${page}` : '/genre-list/', {
					agent: config.UA_WINDOWS,
				})
			)?.data
			const $ = Cheerio.load(html)
			let data: IGenre[] = []
			if (genre) {
				$('div.page > div.col-md-4').each((i, elm) => {
					data[i] = {
						title: $(elm).find('div.col-anime-title > a').text().trim(),
						url: $(elm).find('div.col-anime-title > a').attr('href')!,
						image: $(elm).find('div.col-anime-cover > img').attr('src'),
						rating: parseFloat($(elm).find('div.col-anime-rating').text().trim()),
						episodes: parseInt($(elm).find('div.col-anime-eps').text().trim()),
						date: $(elm).find('div.col-anime-date').text().trim(),
						studio: $(elm).find('div.col-anime-studio').text().trim(),
						genre: this.parseGenre($(elm).find('div.col-anime-genre').text()),
					}
				})
				const total_page =
					parseInt(
						$('div.pagenavix > .page-numbers')
							.filter((_, el) => Number.isInteger(parseInt($(el).text())))
							.last()
							.text(),
					) || null
				return { data, page, total_page, total: data.length }
			} else {
				$('ul.genres > li > a').each((i, elm) => {
					data[i] = {
						title: $(elm).text().trim(),
						url: $(elm).attr('href')!,
					}
				})
				return { data, total: data.length }
			}
		} catch (err) {
			throw err
		}
	}
}
