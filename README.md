# tmpfs.org

Static [tmpfs][] website.

---

- [Create](#create)
- [Stage](#stage)
- [Deploy](#deploy)
- [Cache](#cache)
- [Developer](#developer)
  - [Scripts](#scripts)
- [License](#license)
- [HTML Validation](#html-validation)

---

The website is deployed to [s3][]. To configure for your own domain you should modify the [configuration](/sbin/config.js) and add authentication credentials to a `.env` file, see [.env.example](/.env.example).

## Create

Then you can create the [s3][] bucket with:

```
./sbin/create
```

## Stage

The deploy logic performs some additional optimization of the assets so before deploying to mimic a full production deployment you should compile using:

```
npm run compile
```

And then serve the assets using [static-server][]:

```
static-server -p 1111 public
```

## Deploy

And deploy the `public` folder with:

```
./sbin/deploy
```

For a `production` deployment you should run:

```
npm run deploy
```

Which will compile the website for a production environment and transfer the files to [s3][].

## Cache

To configure the cache control for the [s3][] bucket run:

```
./sbin/cache 86400
```

To set `Cache-Control: max-age 86400`. Note that the `Expires` header for HTTP 1.0 clients is always set far into the future.

## Developer

### Scripts

#### Watch

To watch the sources and compile on change use the [spike][] executable:

```
spike watch
```

#### Compile

To compile the static web site and minify assets with the *production* environment run:

```
npm run compile
```

#### Lint

Run the source tree through [standard][] and [snazzy][]:

```
npm run lint
```

#### Clean

Remove generated files:

```
npm run clean
```

#### Readme

To build the readme file from the partial definitions (requires [mkdoc][]):

```
npm run readme
```

## License

MIT

## HTML Validation

Install [linkdown][] and start a production server:

```
spike watch --env production
```

Then you can validate the HTML of the entire site with:

```
linkdown v http://localhost:1111 --bail
```

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on January 18, 2017

[tmpfs]: http://www.tmpfs.org
[s3]: https://aws.amazon.com/s3/
[node]: https://nodejs.org
[spike]: https://github.com/static-dev/spike
[standard]: https://github.com/feross/standard
[snazzy]: https://github.com/feross/snazzy
[mkdoc]: https://github.com/mkdoc/mkdoc
[linkdown]: https://github.com/tmpfs/linkdown
[static-server]: https://github.com/nbluis/static-server

