import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { messagesCookie } from "~/cookies.server";

import { LoaderArgs, json} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request);

  if (!user) return redirect("/login");

  return json({ user });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const msg = formData.get("msg");
  const cookieHeader = request.headers.get("Cookie");
  const currentMessages = (await messagesCookie.parse(cookieHeader)) || [];
  const response = await walker_run(utterance=msg);
  const messages = [
    ...currentMessages,
    { msg, type: "sent" },
    { msg: response, type: "received" },
  ];
  console.log({ setMessages: messages });
 

  return redirect("/", {
    headers: {
      "Set-Cookie": await messagesCookie.serialize(messages as any),
    },
  });
}

export async function walker_run(utterance="", nd = null) {
  const { user } = useLoaderData<typeof loader>();
  // name: string, utterance="", nd = null
  var name = "talker";
  var server = "http://localhost:8000";
  var sentinel_id = "urn:uuid:1a079641-2571-4b18-a6fe-4989055e6b57";
  var token = user.token;
  
  var query = `
  {
    "name": "${name}",
    "ctx": {"utterance": "${utterance}", "verbose": "true"},
    "snt": "${sentinel_id}",
    "detailed":"false"
  }
  `;

  if(nd) { //if we have a node param
    query = `
    {
      "name": "${name}",
      "nd" : "${nd}",
      "ctx": {"utterance": "${utterance}", "verbose": "true"},
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
    if (!result.ok) {
      throw new Error(`HTTP error ${result.status}`);
    }
    return result.json();
  }).then(function (data: { report: { node: { response: string } }[] }): string {
    const { report } = data;
    console.log(data);
    if (!report || report.length === 0 ) {
      throw new Error('Invalid response data');
    }
    return report[0].response;
  }).catch(function (error) {
    console.error(error);
    throw error;
  });
}