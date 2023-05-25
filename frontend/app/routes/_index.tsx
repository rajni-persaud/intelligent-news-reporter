import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
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
      <div className="sm:w-full md:w-2/5">
        <div className="flex-1 p-2 md:p-6 justify-between flex flex-col h-screen lg:h-[80vh]">
          <div className="flex sm:items-center justify-between py-3">
            <div className="flex items-center px-4 border-gray-6 border bg-gray-4 rounded-md py-4 w-full justify-between">
              <div className="relative flex items-center space-x-4">
                <div className="relative">
                  <span className="absolute text-green-9 right-0 bottom-0 z-10 animate-ping">
                    <svg width="14" height="14">
                      <circle cx="7" cy="7" r="7" fill="currentColor"></circle>
                    </svg>
                  </span>
                  <span className="absolute text-green-9 right-0 bottom-0">
                    <svg width="14" height="14">
                      <circle cx="7" cy="7" r="7" fill="currentColor"></circle>
                    </svg>
                  </span>

                  <img
                    src="https://media.licdn.com/dms/image/C4D0BAQGgL1YGTU_TZw/company-logo_200_200/0/1562169152784?e=2147483647&v=beta&t=kDOLBeeS_OBjbQhpjWzyKLkY355-87AKqpjbkv6SjWs"
                    alt=""
                    className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
                  />
                </div>

                <div className="flex flex-col leading-tight">
                  <div className="text-2xl mt-1 flex items-center">
                    <span className="mr-3">Chat75</span>
                  </div>
                  <span className="text-lg text-gray-11">Demo Chat UI</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  className="text-md rounded-lg px-2 py-1 transition duration-500 ease-in-out text-danger-3 dark:text-danger-12 bg-danger-9 hover:bg-danger-10 focus:outline-none focus:ring-2 focus:ring-danger-8"
                >
                  <span className="font-bold text-sm" onClick={toggleTheme}>
                    Toggle Theme
                  </span>
                </button>
                <clearMessagesFetcher.Form
                  method="POST"
                  action="api/clearMessages"
                >
                  <button
                    type="submit"
                    className="text-md rounded-lg px-2 py-1 transition duration-500 ease-in-out text-danger-3 dark:text-danger-12 bg-danger-9 hover:bg-danger-10 focus:outline-none focus:ring-2 focus:ring-danger-8"
                  >
                    <span className="font-bold text-sm">
                      {clearMessagesFetcher.state == "submitting" ? (
                        <>Clearing...</>
                      ) : (
                        <>Clear Messages</>
                      )}
                    </span>
                  </button>
                </clearMessagesFetcher.Form>
              </div>
            </div>
          </div>
          <div
            id="messages"
            className="flex flex-col space-y-4 py-3 bg-gray-3 h-[100%] border-2 border-gray-7  rounded-md overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <ScrollArea className="rounded-md p-6">
              <div className="flex flex-col space-y-8">
                {messages.map((message) => (
                  <>
                    {message.type === "received" && (
                      <MessageReceived msg={message.msg} />
                    )}
                    {message.type === "sent" && (
                      <MessageSent msg={message.msg} />
                    )}
                  </>
                ))}
              </div>
            </ScrollArea>
          </div>
          <InputArea></InputArea>
        </div>
      </div>
    </div>
  );
}

function InputArea() {
  const sendMessageFetcher = useFetcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [transcript, setTranscript] = useState('');
  const [isRunning, setIsRunning] = useState(false);


  const handleTranscript = (event: SpeechRecognitionEvent) => {
    for (const result of event.results) {
      const recognitionResult: RecognitionResult = result[0];
      setTranscript(recognitionResult.transcript);
    }
  }

  const handleStart = () => {
    console.log('setartasdf')
    const recognitionSvc = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new recognitionSvc();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = handleTranscript;
    recognition.start();
    setIsRunning(true);
  }

  const handleStop = () => {
    console.log('stop')
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    setIsRunning(false);
    recognition.stop()
    // setTranscript("")
    handleSendClick()
  }
  
  const submit = useSubmit();

  const handleSendClick = () => {
        if (inputRef.current?.value) {

            const formData = new FormData();
            formData.append('name', inputRef.current.value);
            submit(formData, { method: 'post', action: `/api/sendMessage` });
            setTranscript("")
        }
    }

  return (
    <div className=" px-4 pt-4 mb-2 sm:mb-0">
      {isRunning ?
              <button type="button" onClick={handleStop} className="text-primary-12 hover:text-gray-10 focus:outline-none py-2 px-4">

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
              </button>

              :
              <button type="button" onClick={handleStart} className="text-gray-10 hover:text-primary-12 focus:outline-none py-2 px-4">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>

            }
      <sendMessageFetcher.Form
        method="post"
        action="/api/sendMessage"
        onSubmit={(e) => {
          if (inputRef.current) inputRef.current.value = "";
        }}
        id="sendMessage"
      >
        <div className="relative flex">
          <span className="absolute inset-y-0 flex items-center">
            {/* <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                ></path>
              </svg>
            </button> */}
            
          </span>
          <input type="text" name="msg" hidden value={message} />
          <input
            ref={inputRef}
            type="text"
            value={transcript}
            name="msg"
            placeholder="Write your message!"
            onChange={(event) => setTranscript(event.target.value)}

            // onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-6 focus:ring-2 focus:ring-primary-8/50 focus:outline-none focus:placeholder-gray-7 text-gray-12 placeholder-gray-9 pl-12 bg-gray-4 rounded-md py-3"
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button
              type="submit"
              className="inline-flex dark:text-primary-12 items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-primary-3 bg-primary-9 hover:bg-primary-10 focus:outline-none"
            >
              <span className="font-bold">
                {sendMessageFetcher.state == "submitting" ? (
                  <>Sending...</>
                ) : (
                  <>Send</>
                )}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 ml-2 transform rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      </sendMessageFetcher.Form>
    </div>
  );
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
