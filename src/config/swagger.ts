import swaggerJSDoc, { Options } from "swagger-jsdoc";

// swagger-def.json contains the same information is swagger.ts - the only reason for existense of swagger-def.json is that TS files cannot be used for swagger-jsdoc command

const swggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
      version: "1.0.0",
      description: "a simple description",
    },
  },
  apis: ["./**/*.ts"], // list of files with js-doc annotations to generate swagger from
};

export const swaggerSpec = swaggerJSDoc(swggerOptions);
