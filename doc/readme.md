# tmpfs.org

Static [tmpfs][] website

***
<!-- @toc -->
***

## Deploy

The website is deployed to [s3][]. To configure for your own domain you should modify the [configuration](/sbin/config.js) and add authentication credentials to a `.env` file, see [.env.example](/.env.example).

### Create

Then you can create the [s3][] bucket with:

```
./sbin/create
```

### Deploy

And deploy the `public` folder with:

```
./sbin/deploy
```

For a `production` deployment you should run:

```
npm run deploy
```

Which will compile the website for a production environment and transfer the files to [s3][].

<? @include {=readme} developer.md ?>

<? @include {=readme} license.md links.md ?>
