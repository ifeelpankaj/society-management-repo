import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateEndpoints } from "@rtk-query/codegen-openapi";
import openapiTS, { astToString } from "openapi-typescript";

import config from "../src/openapi/openapi-config.ts";

const openApiInputPath = path.resolve("src/openapi/openapi.json");
const generatedTypesPath = path.resolve("src/lib/api/generated-types.ts");
const generatedApiPath = path.resolve("src/lib/api/generated-api.ts");

async function generateTypes() {
  const openApiDocument = JSON.parse(await readFile(openApiInputPath, "utf8"));
  const ast = await openapiTS(openApiDocument);
  const source = astToString(ast);

  await mkdir(path.dirname(generatedTypesPath), { recursive: true });
  await writeFile(generatedTypesPath, source, "utf8");

  console.log(`Generated OpenAPI types -> ${generatedTypesPath}`);
}

async function generateRtkApi() {
  await generateEndpoints(config);
  console.log(`Generated RTK Query API -> ${generatedApiPath}`);
}

async function main() {
  await generateTypes();
  await generateRtkApi();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
