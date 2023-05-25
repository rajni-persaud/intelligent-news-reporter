import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { messagesCookie } from "~/cookies.server";
import { Theme, useTheme } from "~/utils/theme-provider";

type ChatMessage = { msg: string; type: "sent" | "received" };

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export async function loader({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const currentMessages = (await messagesCookie.parse(cookieHeader)) || [];
  console.log({ messages: currentMessages });

  return { messages: currentMessages as ChatMessage[] };
}

function MessageSent({ msg }: { msg: string }) {
  return (
    <div className="message">
      <div className="flex items-end justify-end">
        <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
          <div>
            <span className="text-[16px] dark:text-primary-12 px-4 py-2 rounded-lg inline-block rounded-br-none text-primary-3 bg-primary-9 border border-primary-8">
              {msg}
            </span>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
          alt="My profile"
          className="w-6 h-6 rounded-full order-2"
        />
      </div>
    </div>
  );
}

function MessageReceived({ msg }: { msg: string }) {
  return (
    <div className="message">
      <div className="flex items-end">
        <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
          <div>
            <span className="text-[16px] px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-2 border border-gray-8 text-gray-12">
              {msg}
            </span>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
          alt="My profile"
          className="w-6 h-6 rounded-full order-1"
        />
      </div>
    </div>
  );
}

export default function Index() {
  const { messages } = useLoaderData<typeof loader>();
  const clearMessagesFetcher = useFetcher();
  const [, setTheme] = useTheme();

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  };

  return (
    <div className="flex justify-center">
      <div className="w-96 bg-white dark:bg-primary-9 rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-200 dark:bg-primary-11">
          <h1 className="text-xl font-bold">Chat</h1>
          <button
            className="w-8 h-8 rounded-full bg-gray-300 dark:bg-primary-10 focus:outline-none"
            onClick={toggleTheme}
          >
            {/* Theme toggler icon */}
          </button>
        </div>
        <div className="flex flex-col h-80 bg-gray-100 dark:bg-primary-10">
          <ScrollArea>
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === "sent" ? (
                  <MessageSent msg={message.msg} />
                ) : (
                  <MessageReceived msg={message.msg} />
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="p-4 bg-gray-500">
          <div className="flex space-x-2">
            <input
              type="text"
              name="msg"
              placeholder="Write your message!"
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="text-sm font-bold text-white bg-blue-500 rounded px-4 py-2 transition duration-500 ease-in-out hover:bg-blue-600 focus:outline-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}