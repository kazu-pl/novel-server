# how to run TS in node with auto refresh when a file got edited

- `yarn ts-node-dev typescript -D`
- add script:

```
// package.json

 "scripts": {
    "dev": "ts-node-dev src/index.ts"
  },

```

it will work but it won't allow you to use relative paths in node. For relative paths see below:

# Relative paths in node

Below instruction assumes that you have installed `ts-node-dev` via `yarn add ts-node-dev -D` already.

- add `"baseUrl": "src"` field in your `tsconfig.json` for typescript typechecking safety (it satisfies TS only, not run time code)
- install `tsconfig-paths` package via `yarn add tsconfig-paths -D`
- add/modify script for running your app like so:

```
// package.json

 "scripts": {
    "dev": "ts-node-dev -r tsconfig-paths/register src/index.ts"
  },

```

THE IMPORTANT CODE IS `tsconfig-paths/register` PART WHICH ALLOWS TO CORRECTLY CHANGE RELATIVE PATHS

After that you can write code like:

```
// any file for example src/index.ts


import logging from "config/logging";
```

And you wont get any error when trying to run your app

### WARNING!

relative paths will work only with `yarn dev` and after building files with `yarn build` relative paths WON'T BE CHANGED so you still gonna run that build with tsconfig-paths/register plugin because otherwise you will get error that some modules were not found.
To make it work, after `yarn build` you can run command (assuming you're in the root directory):

`node -r ts-node/register/transpile-only -r tsconfig-paths/register build/index.js`

found [here](https://stackoverflow.com/questions/61342753/paths-from-tsconfig-json-doesnt-work-after-tsc)
(search for `for anyone still stuck on this:`)

---

#### build sciript for settings with prettier VSC extension installed

```
// package.json


"scripts": {
  "build": "rm -rf build && prettier --write src/ && tsc"
}
```

---

# yarn build does nothing (should build files)

If you run `yarn build` command which is ` "build": "rm -rf build && tsc"` and it does nothing (should create `build` folder with transpiled files) then you probably have UNCOMMENTED field `"noEmit": true` in your `tsconfig.json` file.
When it is COMMENTED it ENABLES to transpile build files (emit them)
WHEN it is UNcommented it DISables to transpile build fules (you can run `yarn build` but it won't do anything)

# Run translited code from build dir

TS does great job with
