import { redirect } from "@remix-run/node";
import { messagesCookie } from "~/cookies.server";

export async function action() {
  return redirect("/", {
    headers: {
      "Set-Cookie": await messagesCookie.serialize([]),
    },
  });
}
