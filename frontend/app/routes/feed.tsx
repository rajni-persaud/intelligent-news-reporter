import React, { useState } from 'react';
import { Link, useFetcher, useLoaderData } from "@remix-run/react";

const Feed: React.FC = () => {
  const loaderData = useLoaderData();
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

  const posts = [
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:2908bb98-fc1a-4afc-b97b-51dff0e9957c",
        "j_timestamp": "2023-05-25T23:34:42.217279",
        "j_type": "node",
        "context": {
            "title": "PlayStation Showcase 2023: all the news from Sony's big gaming event - The Verge",
            "description": "Sony’s PlayStation Showcase on May 24th, was packed with news about games and hardware accessories for the PS5 and PSVR 2. We saw the Project Q handheld, Marathon, and a new trailer for Spider-Man 2. Here’s our coverage of the event.",
            "source": {
                "id": "the-verge",
                "name": "The Verge"
            },
            "link": "https://www.theverge.com/2023/5/24/23734469/sony-playstation-showcase-2023-news-announcements",
            "image": "https://cdn.vox-cdn.com/thumbor/8OjMfHDMDT9Q6-06dzxjFhi8ykk=/0x0:2040x1360/1200x628/filters:focal(924x608:925x609)/cdn.vox-cdn.com/uploads/chorus_asset/file/22015304/vpavic_4278_20201030_0247.jpg",
            "published": "2023-05-24T21:53:16Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:c3ac655c-6b39-48c7-90a8-b00e22e0bb0a",
        "j_timestamp": "2023-05-25T23:34:42.220570",
        "j_type": "node",
        "context": {
            "title": "PlayStation 5 - Project Q Reveal Trailer | PlayStation Showcase 2023 - IGN",
            "description": "Project Q has an 8-inch HD screen attached to DualSense-style grips, and offers all the same haptic features as the regular DualSense controller.",
            "source": {
                "id": null,
                "name": "YouTube"
            },
            "link": "https://www.youtube.com/watch?v=03DEcB2ny4E",
            "image": "https://i.ytimg.com/vi/03DEcB2ny4E/maxresdefault.jpg",
            "published": "2023-05-24T21:05:58Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:445c8014-5e8c-4ee1-9943-0b16b2bcd1f5",
        "j_timestamp": "2023-05-25T23:34:42.221428",
        "j_type": "node",
        "context": {
            "title": "U.S. distances itself from Belgorod incursion into Russia by pro-Ukraine fighters - NBC News",
            "description": "The United States has sought to distance itself from a dramatic raid into Russian territory by pro-Ukraine fighters who appeared to use American equipment in their attack.",
            "source": {
                "id": "nbc-news",
                "name": "NBC News"
            },
            "link": "https://www.nbcnews.com/news/world/us-humvees-incursion-belgorod-russia-ukraine-attack-rcna85946",
            "image": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2023-05/230534-belgorod-mb-0946-92b4b1.jpg",
            "published": "2023-05-24T21:05:03Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:01bbd63f-1a8b-4568-b829-5b78b280b012",
        "j_timestamp": "2023-05-25T23:34:42.222137",
        "j_type": "node",
        "context": {
            "title": "Patrick Mahomes - Priority is 'legacy and winning rings,' not money - ESPN - ESPN",
            "description": "Patrick Mahomes emphasized that his priority is winning Super Bowls, saying \"I worry about legacy and winning rings more than making money.\"",
            "source": {
                "id": "espn",
                "name": "ESPN"
            },
            "link": "https://www.espn.com/nfl/story/_/id/37722831/patrick-mahomes-priority-legacy-winning-rings-not-money",
            "image": "https://a4.espncdn.com/combiner/i?img=%2Fphoto%2F2023%2F0524%2Fr1177767_1296x729_16%2D9.jpg",
            "published": "2023-05-24T20:27:50Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:9e80d531-8689-474d-9b21-89b3942c940a",
        "j_timestamp": "2023-05-25T23:34:42.222898",
        "j_type": "node",
        "context": {
            "title": "95-year-old Australian woman dies after police shoot her with stun gun; officer faces charges - ABC News",
            "description": "A 95-year-old Australian woman has died a week after a police officer shot her with a stun gun in a nursing home as she moved toward him using a walker and carrying a steak knife, in a tragedy that has outraged many Australians",
            "source": {
                "id": "abc-news",
                "name": "ABC News"
            },
            "link": "https://abcnews.go.com/International/wireStory/australian-police-officer-faces-charges-after-shocking-95-99562910",
            "image": "https://s.abcnews.com/images/International/wirestory_2fe75117912f8b26500d617ccde32104_12x5_992.jpg",
            "published": "2023-05-24T20:25:18Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:58acc66a-f9c6-4995-8873-0845659bafcc",
        "j_timestamp": "2023-05-25T23:34:42.224198",
        "j_type": "node",
        "context": {
            "title": "Tina Turner: legendary rock’n’roll singer dies aged 83 - The Guardian",
            "description": "Turner who initially found fame in a turbulent musical partnership, became one of the biggest acts in the world as a solo artist and one of the defining pop icons of the 1980s",
            "source": {
                "id": null,
                "name": "The Guardian"
            },
            "link": "https://www.theguardian.com/music/2023/may/24/tina-turner-legendary-rocknroll-singer-dies-aged-83",
            "image": "https://i.guim.co.uk/img/media/2ae0ea9f849c50e25f5ec347778c2253eee029af/625_4_1801_1080/master/1801.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctZGVmYXVsdC5wbmc&enable=upscale&s=9218bdf905e0d87ecb9218daef48c450",
            "published": "2023-05-24T20:14:00Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:cfe0a4a6-a8cd-4ab9-97d8-e9c4175cb980",
        "j_timestamp": "2023-05-25T23:34:42.225288",
        "j_type": "node",
        "context": {
            "title": "Citigroup abandons long-planned sale of Banamex to pursue IPO - Financial Times",
            "description": "US lender drops previous effort to sell Mexican retail bank it bought in 2001",
            "source": {
                "id": "financial-times",
                "name": "Financial Times"
            },
            "link": "https://www.ft.com/content/fcbf0737-acf8-470c-9e9c-d8eae4a8e996",
            "image": "https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2F8fb44c1c-36fb-49c2-9513-47326b651449.jpg?source=next-opengraph&fit=scale-down&width=900",
            "published": "2023-05-24T20:07:16Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:4acfa9a7-2e66-43bc-b320-4b650651517d",
        "j_timestamp": "2023-05-25T23:34:42.227237",
        "j_type": "node",
        "context": {
            "title": "Fed officials divided over additional interest rate hikes, meeting minutes show - Fox Business",
            "description": "Federal Reserve officials are split over whether to pause their aggressive interest-rate hike campaign at the June policy-setting meeting, minutes showed.",
            "source": {
                "id": null,
                "name": "Fox Business"
            },
            "link": "https://www.foxbusiness.com/economy/fed-officials-divided-need-additional-interest-rate-hikes-meeting-minutes-show",
            "image": "https://a57.foxnews.com/static.foxbusiness.com/foxbusiness.com/content/uploads/2023/01/0/0/federal-reserve-2.jpg?ve=1&tl=1",
            "published": "2023-05-24T20:03:45Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:92b32964-7dc1-4109-8192-d023dc577b5e",
        "j_timestamp": "2023-05-25T23:34:42.228173",
        "j_type": "node",
        "context": {
            "title": "Rita Wilson Addresses That Tense Cannes Film Festival Photo With Tom Hanks - E! NEWS",
            "description": "After a less-than-picture-perfect snap of Tom Hanks and Rita Wilson at the Cannes Film Festival went viral, the singer set the record straight on what happened on the Asteroid City red carpet.",
            "source": {
                "id": null,
                "name": "Eonline.com"
            },
            "link": "https://www.eonline.com/news/1375365/rita-wilson-addresses-that-tense-cannes-film-festival-photo-with-tom-hanks",
            "image": "https://akns-images.eonline.com/eol_images/Entire_Site/2023424/rs_1200x1200-230524080906-1200-Tom-Hanks-Rita-WIlson-Cannes.jpg?fit=around%7C1080:1080&output-quality=90&crop=1080:1080;center,top",
            "published": "2023-05-24T19:11:59Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:1efce5ec-fb68-411c-8b92-0d1d4d8dcc02",
        "j_timestamp": "2023-05-25T23:34:42.228877",
        "j_type": "node",
        "context": {
            "title": "McCarthy sends Republican debt limit negotiators to White House, but sides are 'far apart' - The Associated Press",
            "description": "WASHINGTON (AP) — House Speaker Kevin McCarthy said Wednesday he was sending Republican negotiators to the White House to finish out debt limit  talks, but warned that the two sides are “still far apart” as they try to reach a budget deal with President Joe B…",
            "source": {
                "id": "associated-press",
                "name": "Associated Press"
            },
            "link": "https://apnews.com/article/debt-limit-congress-mccarthy-biden-budget-850273c73ed40f4ad002fa24e50f9b40",
            "image": "https://storage.googleapis.com/afs-prod/media/a2d8037fb2f34c24ad09158df33452b2/3000.webp",
            "published": "2023-05-24T18:56:15Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:f31bb335-b165-4116-b776-dedf704ff587",
        "j_timestamp": "2023-05-25T23:34:42.229597",
        "j_type": "node",
        "context": {
            "title": "SETI Live: A Sign in Space - Simulating First Contact - SETI Institute",
            "description": "What would happen if we received a message from an extraterrestrial civilization? Daniela de Paulis, Artist in Residence at the SETI Institute and the Green ...",
            "source": {
                "id": null,
                "name": "YouTube"
            },
            "link": "https://www.youtube.com/watch?v=zgQq36IR-Lk",
            "image": "https://i.ytimg.com/vi/zgQq36IR-Lk/maxresdefault_live.jpg",
            "published": "2023-05-24T18:17:21Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:a9f9bbc3-869e-4e69-9439-619003c938ac",
        "j_timestamp": "2023-05-25T23:34:42.230352",
        "j_type": "node",
        "context": {
            "title": "Rapper Fetty Wap sentenced to 6 years in prison for drug trafficking scheme - NBC News",
            "description": "Rapper Fetty Wap was sentenced to six years in prison Wednesday for his role in a large-scale drug trafficking scheme that saw narcotics shipped from the West Coast and sold in New Jersey and Long Island.",
            "source": {
                "id": "nbc-news",
                "name": "NBC News"
            },
            "link": "https://www.nbcnews.com/news/us-news/rapper-fetty-wap-sentenced-6-years-prison-drug-trafficking-scheme-rcna86050",
            "image": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2023-05/230524-fetty-wap-se-123p-803a02.jpg",
            "published": "2023-05-24T18:09:38Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:3d5a626b-12b0-4067-a255-aa0f18778224",
        "j_timestamp": "2023-05-25T23:34:42.231029",
        "j_type": "node",
        "context": {
            "title": "Taylor Swift, Ice Spice Remixed Karma for Midnights Til Dawn - Vulture",
            "description": "Taylor Swift announced a remix of “Karma” with rapper Ice Spice as part of a ‘Midnights (Til Dawn Edition)’ out Friday, May 26. The new edition also features another take of “Snow on the Beach” with more Lana Del Rey vocals.",
            "source": {
                "id": null,
                "name": "Vulture"
            },
            "link": "http://www.vulture.com/2023/05/taylor-swift-ice-spice-karma-remix-midnights-til-dawn.html",
            "image": "https://pyxis.nymag.com/v1/imgs/8e9/296/e33859d888034bcde44e01f9e257ef1225-ice-spice-taylor-swift.1x.rsocial.w1200.jpg",
            "published": "2023-05-24T18:02:37Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:d6b1d262-20a2-44d1-a927-bc7d03f31276",
        "j_timestamp": "2023-05-25T23:34:42.231691",
        "j_type": "node",
        "context": {
            "title": "Ja Morant welfare check: Instagram posts prompt visit from police - Commercial Appeal",
            "description": "A Shelby County Sherriff's Office spokesperson said police conducted a welfare check on Memphis Grizzlies star Ja Morant due to Instagram posts.",
            "source": {
                "id": null,
                "name": "Commercial Appeal"
            },
            "link": "https://www.commercialappeal.com/story/sports/nba/grizzlies/2023/05/24/ja-morant-welfare-check-police-memphis-grizzlies-instagram-nike-shoe-deal/70213524007/",
            "image": "https://www.commercialappeal.com/gcdn/presto/2023/05/14/USAT/95ffdabd-6a86-4e28-a49a-32010975b65a-morant.jpg?crop=8000,4500,x1,y221&width=3200&height=1800&format=pjpg&auto=webp",
            "published": "2023-05-24T17:43:19Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:f8d9df2f-dfa7-4a0a-aa1a-90ec83a97464",
        "j_timestamp": "2023-05-25T23:34:42.232441",
        "j_type": "node",
        "context": {
            "title": "Russia’s Wagner boss says over 20K troops have died in Bakhmut, Ukraine - New York Post ",
            "description": "Russia’s Wagner mercenary group lost 20,000 fighters in the ongoing battle for the highly contested Ukrainian city of Bakhmut.",
            "source": {
                "id": null,
                "name": "New York Post"
            },
            "link": "https://nypost.com/2023/05/24/over-20000-of-russias-wagner-troops-have-died-in-bakhmut/",
            "image": "https://nypost.com/wp-content/uploads/sites/2/2023/05/NYPICHPDPICT000011660892.jpg?quality=75&strip=all&w=1024",
            "published": "2023-05-24T17:42:00Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:a0472542-941c-4827-a803-42c4b0af9096",
        "j_timestamp": "2023-05-25T23:34:42.233113",
        "j_type": "node",
        "context": {
            "title": "AG Ken Paxton likely committed impeachable crimes, Texas House investigators say - Houston Chronicle ",
            "description": null,
            "source": {
                "id": "google-news",
                "name": "Google News"
            },
            "link": "https://consent.google.com/m",
            "image": null,
            "published": "2023-05-24T17:13:42Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:27b587a9-52d1-4cc4-bee6-83da1b30999d",
        "j_timestamp": "2023-05-25T23:34:42.233784",
        "j_type": "node",
        "context": {
            "title": "HIV rates in the US are dropping. Here’s why. - The Boston Globe",
            "description": "Massachusetts has seen a recent 15.7 percent drop in new cases, though that progress has not been evenly spread across ethnic and racial groups.",
            "source": {
                "id": null,
                "name": "The Boston Globe"
            },
            "link": "https://www.bostonglobe.com/2023/05/24/metro/hiv-rates-are-dropping-heres-why/",
            "image": "https://bostonglobe-prod.cdn.arcpublishing.com/resizer/PME2tWZ26bCt0OKhFU6Z6BkZFxg=/506x0/cloudfront-us-east-1.images.arcpublishing.com/bostonglobe/Q2WLCB7RVPLZPJ3HV4LSPFZIEI.jpg",
            "published": "2023-05-24T16:42:43Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:410e8e96-5993-4435-b3a6-2bec1f7fd603",
        "j_timestamp": "2023-05-25T23:34:42.234479",
        "j_type": "node",
        "context": {
            "title": "Yellen Says It's Hard to Predict an X-Date - Bloomberg Television",
            "description": null,
            "source": {
                "id": null,
                "name": "YouTube"
            },
            "link": "https://www.youtube.com/watch?v=WZdUtXHpjh0",
            "image": null,
            "published": "2023-05-24T16:34:16Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:f096d1b2-45cb-493d-a806-ee799ea91e3b",
        "j_timestamp": "2023-05-25T23:34:42.235185",
        "j_type": "node",
        "context": {
            "title": "Breathtaking image of Jupiter's swirly storms - Boing Boing",
            "description": "NASA’s Juno space probe orbiting Jupiter captured this breathtaking image of the swirly storms on the largest planet in our solar system. Jupiter’s radius is 69,911 kilometers, 11 times…",
            "source": {
                "id": null,
                "name": "Boing Boing"
            },
            "link": "https://boingboing.net/2023/05/24/breathtaking-image-of-jupiters-swirly-storms.html",
            "image": "https://i0.wp.com/boingboing.net/wp-content/uploads/2023/05/JNCE_2020101_26C00022_23_V01_-_Rendered_-_6.png?fit=1024%2C1024&ssl=1",
            "published": "2023-05-24T16:31:21Z",
            "code": null,
            "summary": null
        }
    },
    {
        "name": "post",
        "kind": "node",
        "jid": "urn:uuid:31fc9b3b-fa7d-4bf2-b658-e433be67fd39",
        "j_timestamp": "2023-05-25T23:34:42.235894",
        "j_type": "node",
        "context": {
            "title": "Celtics’ Joe Mazzulla Deserves Credit For Underrated Game 4 Decision - NESN",
            "description": "Boston Celtics coach Joe Mazzulla might have had his best game of the year in Game 4 on Tuesday, highlighted by one third-quarter decision.",
            "source": {
                "id": null,
                "name": "NESN"
            },
            "link": "https://nesn.com/2023/05/celtics-joe-mazzulla-deserves-credit-for-underrated-game-4-decision/",
            "image": "https://nesn.com/wp-content/uploads/sites/5/2023/05/Joe-Mazzulla-2-1.jpg",
            "published": "2023-05-24T16:07:07Z",
            "code": null,
            "summary": null
        }
    }
];

// to here


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
            <div key={item.id} className="bg-white shadow rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-2">{item.context.title}</h2>
              <p className="text-gray-600 mb-4">{item.context.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-gray-500">{`By ${item.context.source.name}`}</p>
                <p className="text-gray-500">{item.context.published}</p>
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

export default Feed;