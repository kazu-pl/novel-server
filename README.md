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

# How to generate swagger-schema.json file using swagger-jsdoc to generate interfaces in front-end application via swagger-typescript-api

- `1` - install globally swagger-json via `npm install -g swagger-jsdoc`
- `2` - create `swagger-def.js` or `swagger-def.json` file that contains options to generating swagger. Example:

```
// src/config/swagger-def.json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Express API for JSONPlaceholder",
    "version": "1.0.0",
    "description": "This is a REST API application made with Express. It retrieves data from JSONPlaceholder.",
    "license": {
      "name": "Licensed Under MIT",
      "url": "https://spdx.org/licenses/MIT.html"
    },
    "contact": {
      "name": "JSONPlaceholder",
      "url": "https://jsonplaceholder.typicode.com"
    }
  },
  "servers": [
    {
      "url": "http://localhost:3000",
      "description": "Development server"
    }
  ]
}


```

- `3` - run `swagger-jsdoc -d src/config/swagger-def.json src/Router.ts` where `src/Router.ts` are the paths to your files with JSDoc comments

- `3a` - you can also add script for generating `json` file like so:

```
// package.json

  "scripts": {
    "generateSwaggerJson": "swagger-jsdoc -d src/config/swagger-def.json src/Router.ts"
  },
```

- `4` - it will create swagger.json in the same directory from which you run the command

Instruction on how to do this was found [here](https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do), just search for `You have to have Java installed, then just run`
also [here](https://www.youtube.com/watch?v=S8kmHtQeflo) is link to nice YT video on how to start with writting JSdoc comments to document your API

- `5` - next, you can share your `swagger-schema.json` file via route so you can pass that url in `swagger-typescript-api` package to generate types for front-end application:

Share `json` file on the server via endpoint:

```
// router.ts

import swaggerJsonSchema from "../swagger.json";

Router.use("/swagger/schema.json", (req, res) => res.send(swaggerJsonSchema));
```

---

- `6` - _ADDITIONAL_ When you generated `swagger-schema.json` file and shared it on the backend, you can use the route for that file and generate interfaces on your front-end application:

- `6a` - create `generateTypes.js` file in the root directory of your front-end application:

```
// generateTypes.js

const { generateApi } = require("swagger-typescript-api");
const path = require("path");

generateApi({
  name: "nameOfMyGeneratedFIle.types.ts",
  output: path.resolve(process.cwd(), "./src/types"), // path in which the file with interaces will be created
  url: "http://localhost:4000/swagger/schema.json", // THIS IS THE ENDPOINT THAT SERVES `swagger-schema.json`
  generateClient: false,
  generateRouteTypes: false,
}).catch((e) => console.error(e));


```

- `6b` - add script to your `package.json` to generate types:

```
// package.json

 "scripts": {
    "generate-types": "node ./generateTypes.js"
  },


```

- `6c` - run `yarn generateTypes` to generate file containg interfaces api types

Additionaly, you can modify your `start` script to generate types with every start of your application. You will know if api changed:

```
"scripts": {
    "start": "yarn generate-types && react-scripts start",
    "generate-types": "node ./generateTypes.js"
  },
```
