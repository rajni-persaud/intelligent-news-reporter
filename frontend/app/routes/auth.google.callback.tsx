import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export let loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
