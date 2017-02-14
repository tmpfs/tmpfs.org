# tmpfs.org

Static [tmpfs][] website.

---

- [Environments](#environments)
  - [Devel](#devel)
  - [Production](#production)
- [HTML Validation](#html-validation)
- [Devops](#devops)
  - [Create](#create)
  - [Deploy](#deploy)
  - [Cache](#cache)
- [Developer](#developer)
  - [Scripts](#scripts)
- [License](#license)

---

## Environments

Install [makestatic][] globally (`npm i -g makestatic`).

### Devel

For the development environment run:

```
makestatic -w
```

### Production

For production use the `--env` option:

```
makestatic -w --env production
```

## HTML Validation

Install [linkdown][] and start a production server:

```
makestatic -w --env production
```

Then you can validate the HTML of the entire site with:

```
linkdown v http://localhost:1111 --bail
```

## Devops

### Create

The website is deployed to [s3][]. To configure for your own domain you should modify the [configuration](/app.production.js) and add authentication credentials to the `~/.aws/credentials` file (modify the credentials `profile` as needed), you will need to set the `deploy` configuration `publish` flag to `false` to create the buckets then you can run:

```
npm run deploy
```

After the buckets have been created set `publish` to `true` so that future deployments won't attempt to create and configure the buckets -- they will just sync local files with the s3 bucket.

### Deploy

To deploy a `production` deployment you should run:

```
npm run deploy
```

Which will compile the website for a production environment and transfer the files to [s3][].

### Cache

To configure the cache control for the [s3][] bucket first compile the website:

```
makestatic --env production
```

Then run specifing the number of seconds for the `Cache-Control` header:

```
./sbin/cache 86400
```

To set `Cache-Control: max-age 86400`. Note that the `Expires` header for HTTP 1.0 clients is always set far into the future.

To bypass browser caching set seconds to zero; in which case the header is set to `no-store, no-cache, must-revalidate`.

## Developer

### Scripts

#### Watch

To watch the sources and compile on change use the [makestatic][] executable:

```
makestatic -w
```

#### Compile

To compile the static web site and minify assets with the *production* environment run:

```
makestatic --env production
```

#### Lint

Run the source tree through [standard][]:

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

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on February 14, 2017

[tmpfs]: https://tmpfs.org
[s3]: https://aws.amazon.com/s3/
[node]: https://nodejs.org
[makestatic]: https://github.com/makestatic/compiler
[standard]: https://github.com/feross/standard
[mkdoc]: https://github.com/mkdoc/mkdoc
[linkdown]: https://github.com/tmpfs/linkdown

