// import { useRouteData } from "@remix-run/react";
import { Form, Link, useFetcher } from "@remix-run/react";
// import { Redirect } from "react-router";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";

export let meta = () => {
  return [
    {
      title: "Login - My App",
      description: "Login to My App to access your account.",
    },
  ];
};

export let loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    return redirect("/newsfeed");
  }
  console.log({ user });
  return { user };
};

function Login() {
  //   const data = useRouteData<{ isLoggedIn: boolean }>();

  //   if (data.isLoggedIn) {
  //     return <Redirect to="/dashboard" />;
  //   }

  return (
    <div>
      <h1>Login</h1>
      <form>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" />
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
        <br />
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Don't have an account? Register now!</Link>

      <Form action="/auth/google" method="post">
        <button>Login with Google</button>
      </Form>
    </div>
  );
}

// export function meta() {
//   return {
//     title: "Login - My App",
//     description: "Login to My App to access your account.",
//   };
// }

// export function loader() {
//   return { isLoggedIn: false };
// }

export default Login;
