# tmpfs.org

Static [tmpfs][] website.

***
<!-- @toc -->
***

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

Cache control for `production` is set to one year for the `stage` environment the [s3][] objects are configured to never cache with `no-store, no-cache, must-revalidate`.

<? @include {=readme} developer.md ?>

<? @include {=readme} license.md links.md ?>

