# tmpfs.org

Static [tmpfs][] website.

---

- [Create](#create)
- [Deploy](#deploy)
- [Developer](#developer)
  - [Scripts](#scripts)
- [License](#license)

---

The website is deployed to [s3][]. To configure for your own domain you should modify the [configuration](/sbin/config.js) and add authentication credentials to a `.env` file, see [.env.example](/.env.example).

## Create

Then you can create the [s3][] bucket with:

```
./sbin/create
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

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on January 18, 2017

[tmpfs]: http://www.tmpfs.org
[s3]: https://aws.amazon.com/s3/
[node]: https://nodejs.org
[spike]: https://github.com/static-dev/spike
[standard]: https://github.com/feross/standard
[snazzy]: https://github.com/feross/snazzy
[mkdoc]: https://github.com/mkdoc/mkdoc

