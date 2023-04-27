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

export function walker_run(name: string, utterance="", nd = null) {
  name = "talker";
  var server = "http://localhost:8000";
  var sentinel_id = "";
  var token = "";

  var query = `
  {
    "name": "${name}",
    "ctx": {"utterance": "${utterance}"},
    "snt": "${sentinel_id}",
    "detailed":"false"
  }
  `;

  if(nd) { //if we have a node param
    query = `
    {
      "name": "${name}",
      "nd" : "${nd}",
      "ctx": {"utterance": "${utterance}"},
      "snt": "${sentinel_id}",
      "detailed":"false"
    }
    `;
  }

  return fetch(`${server}/js/walker_run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`
    },
    body: query,
  }).then(function (result) {
    return result.json();
  });
}

