import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { messagesCookie } from "~/cookies.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const msg = formData.get("msg");
  const cookieHeader = request.headers.get("Cookie");
  const currentMessages = (await messagesCookie.parse(cookieHeader)) || [];
  const response = await walker_run();
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

export async function walker_run() {
  // name: string, utterance="", nd = null
  var name = "get_post";
  var server = "http://localhost:8000";
  var sentinel_id = "urn:uuid:91be117d-02fe-44bf-a150-d38f2b04c8e2";
  var token = "bb368ae19adaed976a00d482cb78d128573895485305a7a0b1baf186f3370348";
  var utterance = "";
  var nd = "urn:uuid:86cdc78c-18f7-4ad0-b54d-13b9a0ed0937";

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
      "ctx": {},
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
  }).then(function (data: { report: { node: { jid: string } }[] }): string {
    const { report } = data;
    console.log(data);
    if (!report || report.length === 0 || !report[0] || !report[0]) {
      throw new Error('Invalid response data');
    }
    return report[0].jid;
  }).catch(function (error) {
    console.error(error);
    throw error;
  });
}