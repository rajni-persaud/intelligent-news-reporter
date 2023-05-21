import { createCookie } from "@remix-run/node";

export const messagesCookie = createCookie("messages", {
  maxAge: 604_800, // one week
});
