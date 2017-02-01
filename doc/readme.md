# tmpfs.org

Static [tmpfs][] website.

***
<!-- @toc -->
***

## Environments

Install [makestatic][] globally: `npm i -g makestatic`.

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

The website is deployed to [s3][]. To configure for your own domain you should modify the [configuration](/sbin/config.js) and add authentication credentials to a `.env` file, see [.env.example](/.env.example).


Create the [s3][] bucket with:

```
./sbin/create
```

### Deploy

To deploy a `production` deployment you should run:

```
npm run deploy
```

Which will compile the website for a production environment and transfer the files to [s3][].

### Cache

To configure the cache control for the [s3][] bucket first compile the website:

```
npm run compile
```

Then run specifing the number of seconds for the `Cache-Control` header:

```
./sbin/cache 86400
```

To set `Cache-Control: max-age 86400`. Note that the `Expires` header for HTTP 1.0 clients is always set far into the future.

To bypass browser caching set seconds to zero; in which case the header is set to `no-store, no-cache, must-revalidate`.

<? @include {=readme} developer.md ?>

<? @include {=readme} license.md links.md ?>

