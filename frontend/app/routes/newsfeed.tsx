import React from 'react';

const NewsFeed: React.FC = () => {
  const newsItems = [
    {
      id: 1,
      title: 'Lorem Ipsum',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      author: 'John Doe',
      timestamp: 'May 18, 2023',
    },
    {
      id: 2,
      title: 'Lorem Ipsum',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      author: 'John Doe',
      timestamp: 'May 18, 2023',
    },
    // Add more news items here
  ];

  return (
    <div className="h-screen bg-gray-200 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 mb-4"
          >
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600 mb-4">{item.content}</p>
            <div className="flex items-center justify-between">
              <p className="text-gray-500">{`By ${item.author}`}</p>
              <p className="text-gray-500">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
