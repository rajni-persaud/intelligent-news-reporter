import { red } from "@radix-ui/colors";
import { LoaderArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request);

  if (!user) return redirect("/login");

  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return <p>{JSON.stringify({ user })}</p>;
}
