# otakudesu-api

<div align="center">
	
## Otakudesu API based on Web Scraping

</div>

## Usage

```ts
import OtakudesuApi from "otakudesu-api"

const api = OtakudesuApi();

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

const genreDetail = await api.genreDetail('/genres/action/')

// with paging
const genreDetail = await api.genreDetail('/genres/action/', 2)
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

## License

Copyright &copy; 2024 zeindevs. Licensed under the Apache License, Version 2.0 (the "License");
