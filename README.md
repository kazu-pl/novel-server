# TODO:

1 - wgrać te sprawdzenia zdjęć (masz je w stage)
2 - zrobić upgrade dostępnych parametró w url w swagger do adresów gdzie pobierasz lsitydanych

# How to NOT send any response data, only status like 200:

```tsx
return res.status(200).json(null);
```

# How simulate relations / references of one model in another model by using `ref` attribute and `populate`

```ts
import mongoose, { Schema, Document } from "mongoose";

export interface Act {
  title: string;
  description: string;
  postedBy: string;
}

export interface ActDocument extends Act, Document {}

const ActSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  postedBy: {
    type: mongoose.Types.ObjectId, // add info that it will be mongoDB objectId type
    ref: "character", // 'character' is the name of another model, for example this Act model name is `act`
  },
});

// below is this current model name which is `act`
export default mongoose.model<ActDocument>(`act`, ActSchema);
```

In MongoDB, Population is the process of replacing the specified path in the document of one collection with the actual document from the other collection.

Then when you will try to get all Acts the `postedBy` field will be just string but you can "populate" it which will return the whole object instaed that the ref was reffering to:

```ts
router.get("/acts", (req, res) => {
  ActModel.find()
    .populate("postedBy") // with this as `postedBy` key you will get the WHOLE character model data instead of just its id
    // .populate("postedBy", "_id name") // you can also pass 2nd argument to select only those 2 fields you want to show instead of the whole object. Pass then after space.
    .then((data) => {
      return res.status(200).json({
        data,
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});
```

explanation and more info [here](https://www.geeksforgeeks.org/mongoose-populate-method/)

You can also search for acts that were posted by current user:

```ts
router.get("/acts", (req, res) => {
  ActModel.find({
    postedBy: req.user._id, // you can use here any user / any model id becuase you specified in Act model that postedBy is `ref` and of type `mongoose.Types.ObjectId`
  })
    .then((data) => {
      return res.status(200).json({
        data,
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});
```

# How to find some resource and update it at the same time:

```tsx
router.put("/unlike", (req, res) => {
  PostModel.findByIdAndUpdate(
    req.body.postId,
    {
      $push: {
        // $push will add something to comments array (because comments is an array), while $pull will remove something
        comments: `new comment`, // `comments` is the field you specify in Model, it's one of those fields like `title` or `description`
      },
    },
    {
      new: true, // You should set the new option to true to return the document after update was applied. more info here: https://mongoosejs.com/docs/tutorials/findoneandupdate.html#getting-started
    }
  ).exec((error, result) => {
    if (error) {
      return res.status(422).json({ error });
    } else {
      return res.json({ result });
    }
  });
});
```

# how to generate tsconfig.json with default values:

First, install typescript with:
`yarn add typescript -D`

and then generate default typescript config file with:
`npx tsc --init`

# how to find documents whose `title` or `name` or whatever field contains full or part string that front send in url as `search` param

```tsx
// src/controllers/character.controller.ts

const getCharacters = async (req: RequestWithJWT, res: Response) => {
  const { sortBy, sortDirection, pageSize, currentPage, search } = req.query;

  const allData = await CharacterModel.find({
    ...(search && {
      // found here: https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
      title: {
        $regex: search as string,
        $options: "i", // allow to search string/part of a string in the whole `title` value, not just if it starts with `search` value
      },
    }),
  })
    .limit(size)
    .sort({ [sortKey]: direction })
    .skip(size * (page - 1))
    // .skip(size * page) // use this if you want to start pagination at page=0 instead of page=1
    .exec();

  const totalItems = await CharacterModel.find({
    ...(search && {
      title: {
        $regex: search as string,
        $options: "i",
      },
    }),
  }).countDocuments();

  return res.status(200).json({
    data: allData,
    totalItems,
  });
};
```

# forgot password doesn't work anymore

to use Gmail you need to enable `lesssecureapps` option, you can do this here:
https://myaccount.google.com/lesssecureapps
but remember that Gmail will disable if after some time anyway so you have to update it once a while
found here: https://www.youtube.com/watch?v=Va9UKGs1bwI

# CORS problem after pushing server to heroku

If your server needs some env variables you have to add them FIRST (before pushing app to heroku). Or you need to rebuild the whole app afters is deployed but I'm not sure if its possible on heroku to rebuild already deployed app.

# How to push this repo to heroku:

Basic steps are shown on your profile heroku dashboard:

- `1` - Install the Heroku CLI (if you haven't):

- Download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
  -If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.
- login in heroku from your terminal:

```
$ heroku login
```

- `2` - Deploy your changes:

```
$ git push heroku master
```

BUT, the problem with that command is that it pushes YOUR master to heroku master by default.
Heroku will update its app when you push to heroku repo master banch.
If you want to push your other branch like develop (becuase you want to create stagging app from your develop for example), then run:

```
$ git push heroku develop:master
```

If you want to push your develop into heroku master branch but you use `git push heroku master` then app may won't work and throw an error like:

#### WARNING:

IF YOU ACCIDENTLY REMOVED YOUR HEROKU REMOTE YOU CAN ADD IT WITH THE FOLLOWING COMMAND:

```
$ heroku git:remote -a my-projekt-name
```

#### Procfile

Heroku app will search for `Procfile` file to get to know to to run your app. If it's not provided, it will just run `node index.js` but this repo can't be started with that command (you use `ts-node-dev` which imports `ts-node` and `tsconfig-paths` to resolve paths in files).
So to run the app correctly on heroku, you need to create `Procfile` file in the app root dir and paste following command:

```
./Profile   (pay attention that its lowercase and there's no any extension type)

web: node -r ts-node/register/transpile-only -r tsconfig-paths/register build/src/index.js
```

command `node -r ts-node/register/transpile-only -r tsconfig-paths/register build/src/index.js` is exactly the same one that you can find in `package.json` with `yarn start` script.

Above command uses packages:

```json
  "ts-node-dev": "^1.1.8",
  "tsconfig-paths": "^3.11.0"
```

Because those 2 packages are required to run builded app, you have to put them in `dependencies` and not in `devDependecies` because if they will be in devDependencies they will be removed after app is builded and the start script won't work.

#### How to log into your heroku app bash from your command to see file structure of your app on heroku etc:

To log connect with your heroku app in bash, you can use:

```

$ heroku run bash -a APPNAME

```

When you use this command you can use commands like `ls` or `cd ..` etc

To logout, use:

```

$ exit

ctrl + c

```

found [here](https://stackoverflow.com/questions/38924458/how-to-see-files-and-file-structure-on-a-deployed-heroku-app)

#### env in heroku app:

if your app uses `.env` file wih some environment variables, then you can add them in heroku dashboard. To do so, go to `Settings` and search for `Config Vars`

#### track errors when build failed:

with command `heroku logs --tail` runned in your terminal you have real-time logs of your app. If anything happend, you can check in your terminal for the errors. If you accidently pushed from master branh (which may be not ready by the time) or forgot about putting `ts-node-dev` and `tsconfig-paths` into dependencies, you may see error like this:

```
Restarting
State changed from up to starting
Stopping all processes with SIGTERM
Process exited with status 143
Starting process with command `node -r ts-node/register/transpile-only -r tsconfig-paths/register build/src/index.js`

internal/modules/cjs/loader.js:905
throw err;
^

Error: Cannot find module 'ts-node/register/transpile-only'   (THIS IS THE ERROR)
Require stack:
- internal/preload
```

REMEMBER THAT IF YOU PUSH WITH heroku APP LOGIN (THEY WAY IT'S SHOWN ABOVE) YOU HAVE TO MANUALLY PUSH UPDATES TO HEROKU APP. OTHERWISE YOU CAN PUSH TO REMOTE GITHUB REPO BUT THE HEROKU APP WILL NOT APPLY ANY CHANGES.

But you can also deploy by connecting to your GitHub and automate the whole process so you don't need to manually push changes to heroku app.

# How to get id as string from ObjectId type

field `_id` is type of ObjectId. (full type is: Schema.Types.ObjectId)

so if you console log it, it returns something like this:

```ts
new ObjectId("asdf4gbr5hj34jfgn4n5g");
```

So to get the string itself you need to call `toString()` method, like this (if that method does not exist, try to cast that id as `any`):

```ts
user.updateOne({
  gameSaves: user.gameSaves?.filter((save) => save._id.toString() !== saveId),
});
```

# how to run TS in node with auto refresh when a file got edited

- `yarn ts-node-dev typescript -D`
- add script:

```json
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

```json
// package.json

 "scripts": {
    "dev": "ts-node-dev -r tsconfig-paths/register src/index.ts"
  },

```

THE IMPORTANT CODE IS `tsconfig-paths/register` PART WHICH ALLOWS TO CORRECTLY CHANGE RELATIVE PATHS

After that you can write code like:

```ts
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

```json
// package.json


"scripts": {
  "build": "rm -rf build && prettier --write src/ && tsc"
}
```

---

# How to store images and other files in MongoDB:

Here is a [link](https://stackoverflow.com/questions/59717140/how-to-replace-gridstore-to-gridfsbucket) that shows how to fix `gfs` problems. Just search for answer starting with: `I ended up having the same issue, you have most likely determined that readstream`

Here are some links with usefull information:

- `1` - [link](https://dev.to/shubhambattoo/uploading-files-to-mongodb-with-gridfs-and-multer-using-nodejs-5aed) with some example on using GridFsStorage
- `2` - [link](https://blog.logrocket.com/uploading-files-using-multer-and-node-js/)
- `3` - [link](https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/)
- `4` - [link](https://www.dotnetcurry.com/nodejs/1422/store-binary-using-mongodb-gridfs)

# yarn build does nothing (should build files)

If you run `yarn build` command which is ` "build": "rm -rf build && tsc"` and it does nothing (should create `build` folder with transpiled files) then you probably have UNCOMMENTED field `"noEmit": true` in your `tsconfig.json` file.
When it is COMMENTED it ENABLES to transpile build files (emit them)
WHEN it is UNcommented it DISables to transpile build fules (you can run `yarn build` but it won't do anything)

# How to generate swagger-schema.json file using swagger-jsdoc to generate interfaces in front-end application via swagger-typescript-api

- `1` - install globally swagger-json via `npm install -g swagger-jsdoc`
- `2` - create `swagger-def.js` or `swagger-def.json` file that contains options to generating swagger. Example:

```json
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

#### WARNING:

if you just want to generate interfaces (not whole client) then you can create `schemas.ts` and describe `@swagger` schemas inside of it and pass path to that file. `src/Router.ts` needs to be passed if you have schemas described inside of `Router.ts` and not in separate file or if you want to generate whole client

- `3a` - you can also add script for generating `json` file like so:

```json
// package.json

  "scripts": {
    "generateSwaggerJson": "swagger-jsdoc -d src/config/swagger-def.json src/Router.ts"
  },
```

- `4` - it will create swagger.json in the same directory from which you run the command

Instruction on how to do this was found [here](https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do), just search for `You have to have Java installed, then just run`
also [here](https://www.youtube.com/watch?v=S8kmHtQeflo) is link to nice YT video on how to start with writting JSdoc comments to document your API

Also, [here](https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do) is a link to useful patters like: how to ref some swagger schema in another etc

- `5` - next, you can share your `swagger-schema.json` file via route so you can pass that url in `swagger-typescript-api` package to generate types for front-end application:

Share `json` file on the server via endpoint:

```ts
// router.ts

import swaggerJsonSchema from "../swagger.json";

Router.use("/swagger/schema.json", (req, res) => res.send(swaggerJsonSchema));
```

---

- `6` - _ADDITIONAL_ When you generated `swagger-schema.json` file and shared it on the backend, you can use the route for that file and generate interfaces on your front-end application:

- `6a` - create `generateTypes.js` file in the root directory of your front-end application:

```js
// generateTypes.js

const dotenv = require("dotenv"); // you don't need to install it additionally, it will be globally installed
dotenv.config();

const { generateApi } = require("swagger-typescript-api");
const path = require("path");

generateApi({
  name: "nameOfMyGeneratedFIle.types.ts",
  output: path.resolve(process.cwd(), "./src/types"), // path in which the file with interaces will be created
  url: `${process.env.REACT_APP_API_URL}/swagger/schema.json`, // THIS IS THE ENDPOINT THAT SERVES `swagger-schema.json`
  generateClient: false,
  generateRouteTypes: false,
}).catch((e) => console.error(e));
```

- `6b` - add script to your `package.json` to generate types:

```json
// package.json

 "scripts": {
    "generate-types": "node ./generateTypes.js"
  },


```

- `6c` - run `yarn generateTypes` to generate file containg interfaces api types

Additionaly, you can modify your `start` script to generate types with every start of your application. You will know if api changed:

```json
"scripts": {
    "start": "yarn generate-types && react-scripts start",
    "generate-types": "node ./generateTypes.js"
  },
```

# After generated `swagger-schema.json` on server and use it to generate types on front no file is created

Types generated via `swagger-typescript-api` comes from `"components": {}` key in `swagger-schema.json`. If no file is created after generating types with `swagger-typescript-api` it means that `"components": {}` in json file generated on server is empty
Possible problems:

- schemas are described in another file than jsdoc comments - swagger will work but it wont generate json file correctly so you need to have schemas in the same folder as route comments

### Warning 1:

if you just want to generate interfaces for typed Redux and you want to have schemas in separate file than routig describing comments then you can just pass path to `schemas.ts` because even if you would have more information in generated `swagger-schema.json` file it won't be used (generating interfaces only cares about `"components": {}`)

### Warning 2:

if you want to generate whole client then you have to place schemas and tags in the same folder as routing describing components

# How to add JWT authorize option to swagger:

- `1` - make sure you have swagger options configured like this:

```ts
const swggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0", // you need this
    components: {
      // also needed to JWT
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc(swggerOptions);
```

- `2` - add security fields in swagger jsdoc annotations like this:

```ts
// Router.ts

/**
 * @swagger
 *  /cms/protected:
 *  get:
 *    security:             // <--- you need this
 *      - bearerAuth: []    // <--- you need this
 *    summary: sample protected route
 *    tags: [Auth CMS admins]
 *    responses:
 *      200:
 *        description: The book description by id
 */
Router.get(
  PATHS_ADMIN_AUTH.PROTECTED,
  authenticate,
  authorize("admin"),
  (req, res, next) =>
    res.status(200).json({ message: "you're alloved to be here - admin" })
);
```

Found [here](https://stackoverflow.com/questions/50736784/how-to-authorise-swagger-jsdoc-with-jwt-token) - search for `To make this work, you will need to add the openAPI property to your swaggerDefinition object.`

# how to make cookie-session auth in swagger instead of JWT:

1 - specify swagger options:

```ts
//  src/swagger/swaggerSpec.ts

import swaggerJSDoc, { Options } from "swagger-jsdoc";
import { PATHS_SWAGGER } from "constants/paths";

// swagger-def.json contains the same information is swagger.ts - the only reason for existense of swagger-def.json is that TS files cannot be used for swagger-jsdoc command

const swggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Novel-server",
      version: "1.0.0",
      description: "This is a server for Novel project",
    },
    externalDocs: {
      url: PATHS_SWAGGER.SWAGGER_SCHEMA_JSON,
      description: "Link to swagger-schema.json",
    },
    components: {
      securitySchemes: {
        //// here you can find how to handle cookie-session auth: https://swagger.io/docs/specification/authentication/cookie-authentication/
        cookieAuth: {
          type: "apiKey", //   # arbitrary name for the security scheme; will be used in the "security" key later
          in: "cookie",
          name: "sessionId", // # cookie name
        },
      },
    },
  },
  apis: ["./**/*.ts"], // list of files with js-doc annotations to generate swagger from
};

export default swaggerJSDoc(swggerOptions);
```

2 - use cookie auth instead of JWT at the level of endpoints you want to protect with cookie session:

```ts
// src/routers/any.router.ts

/**
 * @swagger
 * /acts/{id}/edit:
 *  post:
 *    security:
 *      - cookieAuth: []        // <--- here you put cookieAuth instead of bearerAuth >
 *    summary: Used to update act
 *    tags: [Acts]
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SuccessfulReqMsg'
 *      401:
 *        description: unauthorized
 */
actRouter.post(
  PATHS_ACT.EDIT,
  authenticate,
  authorize("admin"),
  actController.updateAct
);
```

# How to receive files and store them in mongoDB:

To receive single file (or couple of files) you have to use `multer`.
Multer is simillar to `express.json()` - it receives images and allows you to use it.
Additionally, you will need `multer-gridfs-storage` - that package allows you to split large files into smaller chunks and store that chunks in mongoDB.
Multer will catch files from request from front-end (front-end sends it in `form-data`), upload file(s) to mongoDB (or locally on server if you wish) and return their name.

#### Upload files to mongoDB:

- `1` - Create middleware `fileUpload.ts`:

```ts
// src/middleware/fileUpload.ts
// this middleware WILL PUSH IMAGES TO MongoDB INSTANTLY ONCE ITS APPLIED AS MIDDLEWARE IN ANY ENDPOINT!

import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { MONGO_DB_URI } from "constants/env";

export const photosBucketName = "photos";

const allowedExtensions = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const storage = new GridFsStorage({
  url: MONGO_DB_URI, // connection string to your mongoDB database in Atlas or local one
  file: (req: Request, file) => {
    if (allowedExtensions.indexOf(file.mimetype) === -1) {
      return file.originalname;
    }

    const originalNameWithoutSpaces =
      file.originalname.split(" ").length > 1
        ? file.originalname.split(" ").join("_")
        : file.originalname;

    return {
      bucketName: "photos", // multer will create 2 collections with that name: photos.files and photos.chunks
      filename: `${Date.now()}-${originalNameWithoutSpaces}`,
    };
  },
});

export default multer({ storage });
```

- `2` - Use `fileUpload.ts` middleware in any endpoint like:

```ts
// Router.ts
import express from "express";

const Router = express.Router();

Router.put(
  "/users/me/avatar",
  fileUpload.single("file"),
  userController.putAvatar
);

// fileUpload.single("") method will receive single file from front-end request and upload it to mongoDB.
// "file" name in `.single("file")` is the name of the field from `form-data` that contains a file.

// if  you want to receive multiple files, use .array() instead:

Router.put(
  "/products/bike/images",
  fileUpload.array("file"), // just send multiple files in `form-data` under the same name as here ("file')
  userController.putProductImages
);
```

- `3` - create Models for files and its chunks to make saerching for files easy:

Multer middleware fill upload file to mongoDB (or your server filesystem if you config it like that) and it won't return you any model.
It also doesn't create any paricular model. It just uploads files to mongoDB and returns its `filename` in `req` object in controllers.
So to make it easy for searching the images, you need to create your own model that you will never use to create new files (multer does it).
You need them just to enable searching for images.

Actuall file model:

```ts
// src/models/photoFileModel.ts

import mongoose, { Schema, Document } from "mongoose";
import { photosBucketName } from "middleware/fileUpload";

interface PhotoFile extends Document {
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  contentType: string;
}

const PhotoFileSchema: Schema = new Schema({
  length: { type: Number, required: true },
  chunkSize: { type: Number, required: true },
  uploadDate: { type: Date, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
});

export default mongoose.model<PhotoFile>(
  `${photosBucketName}.file`,
  PhotoFileSchema
);
```

File chunks model:

```ts
// src/models/FileChunksModel.ts

import mongoose, { Schema, Document } from "mongoose";
import { photosBucketName } from "middleware/fileUpload";

interface PhotoChunk extends Document {
  files_id: string;
  n: number;
  data: string;
}

const PhotoChunkSchema: Schema = new Schema({
  files_id: { type: Schema.Types.ObjectId, required: true },
  n: { type: Number, required: true },
  data: { type: Buffer, required: true },
});

export default mongoose.model<PhotoChunk>(
  `${photosBucketName}.chunk`,
  PhotoChunkSchema
);
```

- `4` - now you can receive that files in controller methods like this:

```ts
// userController.ts

// REMEMBER THAT HERE IN CONTROLLER, IMAGES ARE ALREADY IN MONGO-DB !

const putAvatar = (req: Request, res: Response) => {
  // HERE, you can use file(s) that multer adds to `req` object. If you used `.single()` method, you can get file by:
  // req.file

  // if you used .array() method you can get multiple files by:
  // req.files

  // here, you can use your custom PhotoFileModel to search for that images,
  // THAT'S THE ONLY WAY TO SEARCH FOR THEM because multer won't allow you to customize the data that it sends to mondoDB
  const prevAvatar = await PhotoFileModel.findOne({
    filename: user.data.avatar?.split("/")[2], // path will be like "/files/photoName.png" and [2] is "photoName.png"
  });
  await PhotoChunkModel.deleteMany({ files_id: prevAvatar?._id });
  await prevAvatar?.delete();

  // here, you're creating a endpoint under which you can receive the image that is already in mongo db
  const newAvatarUrl = `/files/${req.file.filename}`; // req.file.filename contains name of the file that is already stored in mongoDB
  await user.update({
    data: {
      ...user.data,
      avatar: newAvatarUrl,
    },
  });

  return res.status(201).json({ avatarUrl: newAvatarUrl });
};

export default {
  putAvatar,
};
```

#### How to send images from front-end to backend:

- `1` - create `ref` and `<input type="file" />` tag and pass that ref to the input:

```tsx
const Component = () => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input id={id} type="file" hidden ref={inputRef} {...rest} />
      <label htmlFor={id}>
        <Button component="span" {...buttonProps}>
          {text}
        </Button>
      </label>
    </>
  );
};
```

- `2` - create `form-data` and append onto it images that you will find in `ref.current`:

```tsx
const fileFromInputRef = inputFileRef.current.files[0];

const formData = new FormData();
formData.append("file", fileFromInputRef); // "file" name is the same name that you use in multer `.single("file")` or `.array('file')`
```

Or, if you want to send multiple files (and use .array('files') option to receive multiple files):

- `2-a` - turn files from ref into array and by using forEach, append it with the same name:

```ts
const filesFromInputRef = Array.from(inputFilesRef.current.files);

const formData = new FormData();

filesFromInputRef.forEach((file) => {
  formData.append("files", file); // "files" is the name under which you send array of images so put 'files' in .array('files')
});
```

- `2-b` - add prop `encType="multipart/form-data"` to form that contains `<input type="file" />`:

```tsx
<Formik
  initialValues={initialMultipleFileValues}
  onSubmit={handleAsyncMultipleSubmit}
  validationSchema={validationMultipleFilesSchema}
>
  {({ isSubmitting, values }) => (
    <Form encType="multipart/form-data">
      {/* add encType="multipart/form-data" to correctly send muliple files */}
      <FileInputFormik
        name="files"
        id="contained-button-file"
        accept="images"
        inputRef={inputFilesRef}
        multiple
        text="select files"
      />
    </Form>
  )}
</Formik>
```

- `3` - send that data via axios:

```tsx
const response = await axiosSecureInstance.put(`/users/me/files`, formData);
```

#### Send files stored in mongoDB to front-end:

```ts
// index.ts // <--- this is main server file

import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

// on the internet you can find examples with `gridfs-stream` package but its depreacated
// so you will need to use gridFSBucket from mongodb
export let gridFSBucket: GridFSBucket;

const conn = mongoose.connection;
conn.once("open", () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'photos,
  });
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_DB_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then((result) => {
    logging.info(NAMESPACE, `Connected to MongoDB!`);
  })
  .catch((err) => {
    logging.error(NAMESPACE, err.message, err);
  });



app.get('/files/:filename', (req, res) => {
  // this endpoint will produce error if it is applied onto Router and not directly here, thats why it's directly in main server file
  PhotoFileModel.findOne({ filename: req.params.filename }) // you need PhotoFileModel to search for files, however you won't need this to create files (multes does it automatically)
    .exec()
    .then((file) => {
      if (file === undefined || file === null) {
        return res.status(404).json({ message: "Photo Not found" });
      }

      //  below line produces an error when you build server via `yarn build` and run via `yarn start`.
      const readStream = gridFSBucket.openDownloadStream(file._id);
      readStream.pipe(res); // here you send file (e.g. picture) to front-end
    })
    .catch((error) => {
      res.status(500).json({
        message: "an error occured",
        error,
      });
    });
});



```
