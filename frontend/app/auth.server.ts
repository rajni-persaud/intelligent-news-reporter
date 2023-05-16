// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { GoogleStrategy } from "remix-auth-google";
import axios from "axios";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

let googleStrategy = new GoogleStrategy(
  {
    clientID:
      "867823900606-7ho4j9mumanh9ajqkuua3pcrh4coh3hi.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback/",
    accessType: "online",
    scope: ["profile", "email"],
  },
  async ({ extraParams, accessToken }) => {
    // Get the user data from your DB or API using the tokens and profile
    const id_token = extraParams.id_token;

    const { data } = await axios.post<User>(
      "http://localhost:8000/auth/google/",
      {
        access_token: accessToken,
        id_token,
        code: "",
        callback_uri: "http://localhost:3000/login/",
      }
    );

    return { email: data.email, token: data.token };
  }
);

type User = {
  email: string;
  token: string;
};

authenticator.use(googleStrategy);
