# tmpfs.org

Static [tmpfs][] website

---

- [Developer](#developer)
  - [Scripts](#scripts)
- [License](#license)

---

## Developer

### Scripts

#### Watch

To watch the sources and compile on change use the [spike][] executable:

```
spike watch
```

#### Compile

To compile the static web site with the *production* environment run:

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

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on January 14, 2017

[tmpfs]: http://www.tmpfs.org
[node]: https://nodejs.org
[spike]: https://github.com/static-dev/spike
[standard]: https://github.com/feross/standard
[snazzy]: https://github.com/feross/snazzy
[mkdoc]: https://github.com/mkdoc/mkdoc

