# tmpfs.org

Static [tmpfs][] website.

***
<!-- @toc -->
***

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
static -p 1111 public
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

<? @include {=readme} developer.md ?>

<? @include {=readme} license.md links.md ?>

## HTML Validation

Install [linkdown][] and start a production server:

```
spike watch --env production
```

Then you can validate the HTML of the entire site with:

```
linkdown v http://localhost:1111 --bail
```
