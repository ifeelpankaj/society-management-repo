import type { components } from "./generated-types";

export type Schema = components["schemas"];

export type ApiModel<T extends keyof Schema> = Schema[T];
