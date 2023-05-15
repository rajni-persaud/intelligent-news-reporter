import { ActionArgs, redirect } from "@remix-run/node";
import axios from "axios";

export async function action({request}:ActionArgs) {
    const formData = await request.formData();
    const code = formData.get("code");
    const data = await axios.post("http://localhost:8000/auth/google/",{code});
    console.log(data);
    return redirect("/login");
}