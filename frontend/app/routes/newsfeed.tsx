import React, { useState } from 'react';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFilter = () => {
    console.log(`Sending query: ${query}`);
    setIsModalOpen(false);
    setShowAlert(true);
    // setQuery('');
  };

  const posts = loaderData?.posts;

  return (
    <div>
      <nav className="bg-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="text-white font-bold text-lg">Intelligent News Reporter</div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              onClick={handleModalOpen}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
        </div>
      </nav>
      <div className="flex items-center justify-center">
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
  
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-screen-2xl mx-auto">
            <h3>Filter newsfeed</h3>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Enter your query"
              className="border border-gray-300 p-2 rounded-lg mb-2"
            />
            <button onClick={handleFilter} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Apply
            </button>
            <button onClick={handleModalClose} className="ml-2 text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
  
      {showAlert && (
        <div className="alert" role="alert">
          Query: {query}
          <button
            type="button"
            className="closebtn"
            onClick={() => setShowAlert(false)}
          >&times;</button>
        </div>
      )}
    </div>
  );  
};

export default NewsFeed;