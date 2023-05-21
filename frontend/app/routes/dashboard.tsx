import { red } from "@radix-ui/colors";
import { LoaderArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { authenticator } from "~/auth.server";
import { walker_run } from "~/utils/utils.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request);
  const graph = await axios.post("http://localhost:8000/js/graph_active_get", {}, {headers: {Authorization: `token ${user?.token}`}});

  if (!graph.data.success) {
     await axios.post("http://localhost:8000/js/sentinel_active_global", {auto_run: "init", auto_create_graph: true}, {headers: {Authorization: `token ${user?.token}`}});
     console.log({graph})
  }

  await axios.post("http://localhost:8000/js/sentinel_pull", {set_active: true}, {headers: {Authorization: `token ${user?.token}`}});

  if (!user) return redirect("/login");

  await walker_run(null, user);

  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();


  return <p>{JSON.stringify({user})}</p>;
}



