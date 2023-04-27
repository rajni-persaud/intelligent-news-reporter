import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ThemeBody, ThemeHead, ThemeProvider } from "~/utils/theme-provider";

import stylesheet from "~/tailwind.css";
import { getThemeSession } from "./utils/theme.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: stylesheet },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
    },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const themeSession = await getThemeSession(request);

  return json({
    theme: themeSession.getTheme(),
  });
};

function App() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <html lang="en" className={loaderData.theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ThemeHead ssrTheme={Boolean(loaderData.theme)} />
      </head>
      <body className="bg-gray-2 text-gray-12">
        <Outlet />
        <ThemeBody ssrTheme={Boolean(loaderData.theme)} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}
