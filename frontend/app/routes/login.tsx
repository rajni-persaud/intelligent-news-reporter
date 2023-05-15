// import { useRouteData } from "@remix-run/react";
import { Link, useFetcher } from "@remix-run/react";
// import { Redirect } from "react-router";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import GoogleSignin from "~/components/GoogleSignin";


export let meta = () => {
    return [
      {
        title: "Login - My App",
        description: "Login to My App to access your account.",
      },
    ];
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

      <GoogleOAuthProvider clientId="59972291133-m408r82jv4usql21kncjloi8pclb3mgv.apps.googleusercontent.com"><GoogleSignin></GoogleSignin></GoogleOAuthProvider>



    </div>
  );
}

// export function meta() {
//   return {
//     title: "Login - My App",
//     description: "Login to My App to access your account.",
//   };
// }

export function loader() {
  return { isLoggedIn: false };
}

export default Login