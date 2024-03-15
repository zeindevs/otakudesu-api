# Otakudesu API (Web Scraper)

<div align="center">

![Otakudesu API](https://socialify.git.ci/zeindevs/otakudesu-api/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&pattern=Solid&pulls=1&stargazers=1&theme=Dark)
	
Otakudesu API is an npm package that can be used to retrieve data from the otakudesu website. This package provides several APIs that can be used to retrieve anime lists, ongoing anime, complete anime, anime information, episodes, genre lists, anime lists by genre, and video links.

[![HitCount](http://hits.dwyl.com/zeindevs/otakudesu-api.svg)](http://hits.dwyl.com/zeindevs/otakudesu-api) [![GitHub license](https://img.shields.io/github/license/zeindevs/otakudesu-api)](https://github.com/zeindevs/otakudesu-api/blob/master/LICENSE) [![Npm package monthly downloads](https://badgen.net/npm/dm/otakudesu-api)](https://npmjs.com/package/otakudesu-api) ![GitHub repo size](https://img.shields.io/github/repo-size/zeindevs/otakudesu-api?style=flat) [![npm version](https://badge.fury.io/js/otakudesu-api.svg)](https://badge.fury.io/js/otakudesu-api)

</div>

## Installation

To install the OdesuS package, you can use npm. Open your terminal or command prompt and type:

```sh
# with npm
npm install otakudesu-api
# with pnpm
pnpm add otakudesu-api
# with yarn
yarn add otakudesu-api
```

## Usage

For usage, you can see the `tests/` folder. The tests folder contains several examples of how to use the Otakudesu API package.

```ts
import OtakudesuApi from 'otakudesu-api'

const api = OtakudesuApi()

// ...
```

### Get Ongoing List

```ts
// ...

const ongoing = await api.ongoing()

// with paging
const ongoing = await api.ongoing(2)
```

### Get Complete List

```ts
// ...

const complete = await api.complete()

// with paging
const complete = await api.complete(2)
```

### Get Genres List

```ts
// ...

const genres = await api.genres()
```

### Get Genres Detail

```ts
// ...

const genres = await api.genres('/genres/action/')

// with paging
const genres = await api.genres('/genres/action/', 2)
```

### Get Detail

```ts
// ...

const detail = await api.detail('/anime/shaman-king-flowers-sub-indo/')
```

### Get Video

```ts
// ...

const video = await api.video('/episode/skflower-episode-10-sub-indo/')
```

## Contribution, and issues

Contributions are welcome, and if you have any issues with this package, you are welcome to open the issue on the [github repository](https://github.com/hansputera/otakudesu-api/issues).

## License

Copyright &copy; 2024 zeindevs. Licensed under the Apache License, Version 2.0 (the "License");
