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

