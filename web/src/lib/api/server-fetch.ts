import { cookies } from "next/headers";

import { appConfig } from "@/lib/config";

const API_BASE_URL = appConfig.apiBaseUrl || "http://localhost:8080/api";

type ServerFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    next: {
      revalidate: options.revalidate ?? 60,
      tags: options.tags,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}
