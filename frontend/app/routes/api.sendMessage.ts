import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { messagesCookie } from "~/cookies.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const msg = formData.get("msg");
  const cookieHeader = request.headers.get("Cookie");
  const currentMessages = (await messagesCookie.parse(cookieHeader)) || [];
  const messages = [
    ...currentMessages,
    { msg, type: "sent" },
    { msg: "This is the response", type: "received" },
  ];
  console.log({ setMessages: messages });

  return redirect("/", {
    headers: {
      "Set-Cookie": await messagesCookie.serialize(messages as any),
    },
  });
}
