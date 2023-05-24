import React from 'react';
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import axios from "axios";

export async function loader({request}: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {failureRedirect: "/login"});

  const preferences = await axios.post(`http://localhost:8000/js/walker_run`, {
      "name": "get_preferences",
      "ctx": {},
      "detailed": false
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${user.token}`,
    },
  }).then(res => res.data)

  const posts = await axios.post(`http://localhost:8000/js/walker_run`, {
    "name": "list_posts",
    "ctx": {},
    "detailed": false
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `token ${user.token}`,
  },
}).then(res => res.data)

// if no news source is selected, go to wizardPage  
if (!preferences.report?.[0].context?.news_sources) {
    return redirect('/WizardPage');
  }

  const transformedPosts = posts.report?.[0] === null ? [] : posts.report?.[0].map(item => item.context) ?? [];

  return json({ preferences: preferences.report?.[0].context, posts: transformedPosts });
}

const NewsFeed: React.FC = () => {
  const loaderData = useLoaderData()
  const posts = loaderData?.posts;

  return (
    <div className="h-screen bg-gray-200 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4">
        {posts.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 mb-4"
          >
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-gray-500">{`By ${item.source.name}`}</p>
              <p className="text-gray-500">{item.published}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
