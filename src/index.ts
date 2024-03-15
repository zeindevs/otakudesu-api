import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import * as Cheerio from 'cheerio'

import { config } from './config'
import {
	IDetail,
	IEpisode,
	IGenre,
	IGenreData,
	IInfo,
	IPost,
	IPostData,
	IVideo,
	IVideoData,
	Payload,
	TFetchURL,
	TInfo,
} from './types'

export default class OtakudesuApi {
	constructor(public AxiosOts?: AxiosRequestConfig) {
		this.AxiosOts = AxiosOts
	}

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
			baseURL: config.BASE_URL,
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
			$('div.infozingle > p').each((i, elm) => {
				let [title, value] = $(elm).find('span').text().split(':')
				let label: TInfo = title.trim().replace(' ', '_').toLowerCase() as TInfo
				info[label] = value.trim()
				// Convert genre to array
				if (label === 'genre') {
					info['genre'] = this.parseGenre(value)
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
						baseURL: config.ADMIN_AJAX_URL,
						method: 'POST',
						headers: {
							...this.makeHeaders(config.UA_WINDOWS),
							'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'x-requested-with': 'XMLHttpRequest',
							Referer: `${config.BASE_URL}${url}`,
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
			let m360p: IVideo[] = []
			let m480p: IVideo[] = []
			let m720p: IVideo[] = []
			new Array('m360p', 'm480p', 'm720p').forEach((media, i) => {
				$('div#embed_holder > div.mirrorstream')
					.find(`ul.${media} > li`)
					.each((_, elm) => {
						let key = $(elm).find('a').attr('data-content')!
						let item = {
							key,
							provider: $(elm).find('a').text().trim(),
							payload: {
								noice: { action: action[1] },
								video: { ...JSON.parse(atob(key)), action: action[0] },
							},
						}
						switch (media) {
							case 'm360p':
								m360p.push(item)
								break
							case 'm480p':
								m480p.push(item)
								break
							case 'm720p':
								m720p.push(item)
								break
						}
					})
			})
			return {
				url: iframe,
				mirror: {
					'360p': m360p,
					'480p': m480p,
					'720p': m720p,
				},
			}
		} catch (err) {
			throw err
		}
	}

	/**
	 * Fetch anime list
	 *
	 * @param genre Genre name
	 * @returns
	 * */
	public list = async (): Promise<any> => {
		try {
			const html = (await this.fetchUrl('/anime-list/', { agent: config.UA_WINDOWS }))?.data
			const $ = Cheerio.load(html)
			let data: any = {}
			$('div#abtext > div.bariskelom').each((_, elm) => {
				let group: any[] = []
				let title = $(elm).find('div.barispenz').text().trim()
				$(elm)
					.find('div.penzbar')
					.each((i, el) => {
						let text = $(el).find('a.hodebgst')
						if (text) {
							group[i] = {
								title: text.text().trim(),
								url: text.attr('href'),
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
	public genres = async (
		genre?: string,
		page: number = 1,
	): Promise<IGenreData> => {
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
