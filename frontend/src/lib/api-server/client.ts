import axios from "axios";
import { cookies } from "next/headers";

import { API_URL } from "@/constants";

async function getCookieHeader() {
  return (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function serverApi() {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      accept: "application/json",
      Cookie: await getCookieHeader(),
    },
  });

  return api;
}
