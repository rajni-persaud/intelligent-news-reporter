import { useState } from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import axios from "axios";

export async function action({request}: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {failureRedirect: "/login"});
  const formData = await request.formData();
  const selectedNewsSources = formData.get("sources");

  const posts = await axios.post(`http://localhost:8000/js/walker_run`, {
      "name": "import_news_data",
      "ctx": {selectedNewsSources: JSON.parse(selectedNewsSources?.toString() || "")},
      "detailed": false
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${user.token}`,
    },
  }).then(res => res.data)

    console.log({posts})

    return redirect("/newsfeed")
}

export async function loader({request}: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {failureRedirect: "/login"});

  const sources = await axios.post(`http://localhost:8000/js/walker_run`, {
      "name": "get_news_sources",
      "ctx": {},
      "detailed": false
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${user.token}`,
    },
  }).then(res => res.data)


  return json({sources: sources.report?.[0]})
}

const WizardPage = () => {
    const loaderData = useLoaderData()
  const submitFetcher = useFetcher();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const newsSources = loaderData?.sources;

  const areasOfInterest = [
    "Sports",
    "Technology",
    "Entertainment",
    "Politics",
    "Health",
    "Science",
  ];

  // State variables for selected choices
  const [selectedNewsSources, setSelectedNewsSources] = useState([]);
  const [selectedAreasOfInterest, setSelectedAreasOfInterest] = useState([]);

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  

  const handleNewsSourceChange = (source) => {
    if (selectedNewsSources.includes(source)) {
      setSelectedNewsSources((prevSources) =>
        prevSources.filter((s) => s !== source)
      );
    } else {
      setSelectedNewsSources((prevSources) => [...prevSources, source]);
    }
  };

  const handleAreaOfInterestChange = (area) => {
    if (selectedAreasOfInterest.includes(area)) {
      setSelectedAreasOfInterest((prevAreas) =>
        prevAreas.filter((a) => a !== area)
      );
    } else {
      setSelectedAreasOfInterest((prevAreas) => [...prevAreas, area]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          News Wizard
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full">
              <div
                className={`bg-indigo-600 text-xs leading-none py-1 rounded-full ${
                  (currentStep / totalSteps) * 100 < 100 ? "w-1/3" : "w-full"
                }`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6 mt-6">
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Step 1: Select News Sources
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Choose the news sources you want to follow.
              </div>
              <ul className="mt-4 space-y-4">
                {newsSources.map((source, index) => (
                  <li key={index}>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        checked={selectedNewsSources.includes(source)}
                        onChange={() => handleNewsSourceChange(source)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {source}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: currentStep === 2 ? "block" : "none" }}>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Step 2: Select Areas of Interest
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Choose the areas of news that interest you the most.
              </div>
              <ul className="mt-4 space-y-4">
                {areasOfInterest.map((area, index) => (
                  <li key={index}>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        checked={selectedAreasOfInterest.includes(area)}
                        onChange={() => handleAreaOfInterestChange(area)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {area}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: currentStep === 3 ? "block" : "none" }}>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Step 3: Confirm Choices
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Review your selections and click "Finish" to confirm.
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">
                  Selected News Sources:
                </h4>
                <ul className="mt-2 text-sm text-gray-500">
                  {selectedNewsSources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">
                  Selected Areas of Interest:
                </h4>
                <ul className="mt-2 text-sm text-gray-500">
                  {selectedAreasOfInterest.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
              >
                Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
              >
                Next
              </button>
            ) : (
                <div className="inline-flex">
<submitFetcher.Form method="post">
                    <input type="hidden" name="sources"  value={JSON.stringify(selectedNewsSources)} />
                    <input type="hidden" name="areasOfInterest"  value={JSON.stringify(selectedAreasOfInterest)} />
<button
            type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
              >
                {submitFetcher.state !== "idle" ? "Loading..." : "Finish"}
              </button>
                </submitFetcher.Form>
                </div>
                
              
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardPage;
