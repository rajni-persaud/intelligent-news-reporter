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
  console.log(walker_run('talker', 'hi'));

  return redirect("/", {
    headers: {
      "Set-Cookie": await messagesCookie.serialize(messages as any),
    },
  });
}

export function walker_run(name: string, utterance="", nd = null) {
  name = "talker";
  var server = "http://localhost:8000";
  var sentinel_id = "urn:uuid:5bcb5823-f594-4af0-9aca-ad1a1ac30f59";
  var token = "b95f225361b0169a9cf7476dc3b96de62b68a7279c33df2c46bcc6fe63da84e9";

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

