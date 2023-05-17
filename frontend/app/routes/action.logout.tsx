import { ActionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export async function loader({request}: ActionArgs) {
    return authenticator.logout(request, {redirectTo: "/"});
}