import type { Metadata } from "next";

export const SITE_NAME = "Society Management";

export const SITE_DESCRIPTION =
  "Manage society flats, residents, claims, and staff access from one admin workspace.";

export const rootMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export function createPageMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
  };
}
