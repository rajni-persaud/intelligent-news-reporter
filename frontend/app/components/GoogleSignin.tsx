import { useGoogleLogin } from "@react-oauth/google";
import { Link, useFetcher } from "@remix-run/react";

export default function GoogleSignin(){
    const fetcher = useFetcher();
    const signIn = useGoogleLogin({

        flow: "auth-code",
        
        redirect_uri: `http://localhost:3000/login`,
        
        state: "offline",
        
        ux_mode: "redirect",
        
        select_account: true,
        
        onSuccess: (codeResponse) => {
          alert(codeResponse.code);
          fetcher.submit({ code: codeResponse.code }, { method: "post", "action": "/google" });
        },
        
        onError: (err) => {
            alert("err");
        
        console.log(err);
        
        },
        
       });


    return <button type="button" onClick={signIn}>Sign in with </button>

}