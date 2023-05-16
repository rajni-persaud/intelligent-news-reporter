import { ActionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export let loader = () => redirect("/login");

export let action = ({ request }: ActionArgs) => {
  return authenticator.authenticate("google", request);
};
