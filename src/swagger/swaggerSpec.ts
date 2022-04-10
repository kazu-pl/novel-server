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
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        //
        //// here you can find how to handle cookie-session auth: https://swagger.io/docs/specification/authentication/cookie-authentication/
        // cookieAuth: {
        //   type: "apiKey", //   # arbitrary name for the security scheme; will be used in the "security" key later
        //   in: "cookie",
        //   name: "sessionId", // # cookie name
        // },
      },
    },
  },
  apis: ["./**/*.ts"], // list of files with js-doc annotations to generate swagger from
};

export default swaggerJSDoc(swggerOptions);
