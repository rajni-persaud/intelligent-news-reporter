import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { messagesCookie } from "~/cookies.server";

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
  // name: string, utterance="", nd = null
  var name = "talker";
  var server = "http://localhost:8000";
  var sentinel_id = "urn:uuid:83151b6e-0f54-49f6-97c7-99280bb44683";
  var token = "10870a4739afd80259351d640d5877a79f26b5fc0f6d667fc78f39f9a4b95e14";
  
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