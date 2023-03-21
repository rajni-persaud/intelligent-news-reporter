# How to run this project on localhost

In your current working directory (Intelligent News Reader folder):

Open a new WSL terminal. We'll refer to this as __*WSL T1*__.


Before you begin running any JAC program, always remember to install or update your current version of jaseci. You can do this by running the following commands in __*WSL T1*__:

`pip3 install jaseci` or `pip3 install jaseci --upgrade`

`pip3 install jaseci-serv` or `pip3 install jaseci-serv --upgrade`

You'll also need to install the modules:

`pip install jac_nlp[all]`

If you encountered an error while trying to install package - sentencepiece, then run the following 3 commands:

`sudo apt-get install pkg-config`

`sudo apt-get install cmake`

`pip install sentencepiece`

Now, try running `pip install jac_nlp[all]` again.

`pip install jac_nlp[use_enc]`

`pip install jac_misc[cluster]`


Next, run the following 2 commands to create mydatabase file. This is only necessary if the mydatabase file is not already in the current folder.

`jsserv makemigrations base`

`jsserv migrate`

Now, we will start the server on port 8000:

`jsserv runserver 0.0.0.0:8000`

Go to localhost:8000/docs/

You should be able to see Jaseci API Docs


Open another WSL terminal. We'll refer to this as __*WSL T2*__.

In __*WSL T2*__:

First, we'll need to create a superuser

`jsserv createsuperuser`

Enter email

Enter password (twice)

Then, login to localhost.

`jsctl -m`

`login http://localhost:8000`

Enter username and password of superuser created above.
If login successful, a token should be generated. We'll refer to this as ***my_token***.

After logging in, we'll need to load the modules: 

`actions load module jac_nlp.t5_sum`

`actions load local inr_actions.py`

`actions load module jac_nlp.use_qa`

`actions load module jac_nlp.use_enc`

`actions load module jac_misc.cluster`

`actions load module jac_nlp.tfm_ner`

`actions load module jac_nlp.zs_classifier`

`actions load module jac_nlp.bart_sum`

This might take a while, especially if you're running it for the first time.

Open another WSL terminal. We'll refer to this as __*WSL T3*__.

In __*WSL T3*__:

`jsctl jac build main.jac`

Note: You must run this command, every time a change is made to your code.


In __*WSL T2*__:

`sentinel register -name main -mode ir main.jir`

`alias list`

We'll refer to the active:sentinel as ***my_sentinel_id***


If you have already registered the sentinel, then just run:

`sentinel set -snt active:sentinel -mode ir main.jir`

You'll need to run this command after you build.

Train the NER model

`walker run tfm_ner_train_model`

Save the NER model

`walker run tfm_ner_save_model -ctx "{\"model_path\" : \"ai/models/tfm_ner\"}"`

If NER model already trained and ready to be loaded from source

`walker run tfm_ner_load_model -ctx "{\"model_path\" : \"ai/models/tfm_ner\"}"`

## In postman

Create a new request:

Select method POST

Enter "http://localhost:8000/js/walker_run" as request URL.

Click on headers tab

Add Authorization as key

Enter "token ***my_token***" [ensure there is 1 space between token and the token you copied]

Copy the JSON Example from the docs under js/walker_run or see below for examples on how to make POST requests.

Under body tab in postman, select raw and change type to JSON

Replace "snt" value with ***my_sentinel_id*** [This can be found in WSL T2]

Ensure you put the walker name.

Send the request

# Sending requests

## walker import_news_data

This walker:
- deletes all the post nodes from the graph.
- creates the posts nodes using data from the JSON file.

``` JSON
{
    "name": "import_news_data",
    "ctx": {"file_path": "news_posts.json"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker import_tag_data

This walker:
- deletes all the tag nodes from the graph.
- creates the tag nodes using data from the JSON file.

``` JSON
{
    "name": "import_tag_data",
    "ctx": {"file_path": "tag_data.json"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker create_post

``` JSON
{
    "name": "create_post",
    "ctx": {
      "title": "Who will benefit from our oil?",
      "description": "From the publishers desk In July 2019, Kaieteur News conducted an extensive review of 130 oil contracts to better understand the extent to which the Guyana-ExxonMobil deal is fraught with unfair provisions. The findings were alarming. On a daily basis, Kaieteur News will expose these alarming provisions. Today, we start with the provision that speaks ",
      "source": "Kaieteur News",
      "link": "https://www.kaieteurnewsonline.com/2020/09/14/who-will-benefit-from-our-oil/",
      "image": null,
      "published": "2020-09-14 20:11:19.210464",
      "code": "gy"
    },
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker update_post

``` JSON
{
    "name": "update_post",
    "nd": "urn:uuid:db0b5d21-1dce-4337-aefd-b64bc028b39f",
    "ctx": {
      "title": "Who will benefit from our oil?",
      "description": "From the publishers desk In July 2019, Kaieteur News conducted an extensive review of 130 oil contracts to better understand the extent to which the Guyana-ExxonMobil deal is fraught with unfair provisions. The findings were alarming. On a daily basis, Kaieteur News will expose these alarming provisions. Today, we start with the provision that speaks ",
      "source": "Kaieteur News",
      "link": "https://www.kaieteurnewsonline.com/2020/09/14/who-will-benefit-from-our-oil/",
      "image": null,
      "published": "2020-09-14 20:11:19.210464",
      "code": "gy"
    },
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker delete_post

``` JSON
{
    "name": "delete_post",
    "nd": "urn:uuid:db0b5d21-1dce-4337-aefd-b64bc028b39f",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker get_post

``` JSON
{
    "name": "get_post",
    "nd": "urn:uuid:8e84b373-3815-43c4-bb33-32cb090cf7c3",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker list_posts

``` JSON
{
    "name": "list_posts",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker summarize_posts

``` JSON
{
    "name": "summarize_posts",
    "ctx": {
        "min_len": 50,
        "max_len": 100
    },
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker create_tag

``` JSON
{
    "name": "create_tag",
    "ctx": {"label": "Crimes"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

``` JSON
{
    "name": "create_tag",
    "ctx": {"label": "Domestic Abuse", "parent_jid": "urn:uuid:6584e410-0812-4efb-9b4a-cdaf3b3191d3"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker update_tag

``` JSON
{
    "name": "update_tag",
    "nd": "urn:uuid:01a2f7d5-027a-443a-9dba-0b0f60ba9404",
    "ctx": {"label": "Trafficking in Persons"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker delete_tag

``` JSON
{
    "name": "delete_tag",
    "nd": "urn:uuid:6584e410-0812-4efb-9b4a-cdaf3b3191d3",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker get_tag

``` JSON
{
    "name": "get_tag",
    "nd": "urn:uuid:6584e410-0812-4efb-9b4a-cdaf3b3191d3",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```


## walker list_tags

``` JSON
{
    "name": "list_tags",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```


## walker add_statement

``` JSON
{
    "name": "add_statement",
    "nd": "urn:uuid:40582857-a287-41a0-b845-408cfaf2d992",
    "ctx": {"text": "Blueface Responds to Chris Brown’s Domestic Violence Defense After He Mentions Chrisean Rock Relationship"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker list_statements

``` JSON
{
    "name": "list_statements",
    "nd": "urn:uuid:40582857-a287-41a0-b845-408cfaf2d992",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker update_statement

``` JSON
{
    "name": "update_statement",
    "nd": "urn:uuid:d305b894-238c-47c1-b930-43db9154840a",
    "ctx": {"text": "Latest Supreme Court-related ruling overturning gun regulations worries domestic violence survivor advocates"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker delete_statement

``` JSON
{
    "name": "delete_statement",
    "nd": "urn:uuid:d305b894-238c-47c1-b930-43db9154840a",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```


## walker get_statement

``` JSON
{
    "name": "get_statement",
    "nd": "urn:uuid:8231e969-b2d1-4152-b539-025470018692",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker tag_posts

``` JSON
{
    "name": "tag_posts",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker semantic_search

``` JSON
{
    "name": "semantic_search",
    "ctx": {"query": "What's the latest in the oil and gas industry in Guyana?"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker get_clusters

You'll need to run __walker summarize_posts__ at least once before running this request.

The default cluster_method is hbdscan:

``` JSON
{
    "name": "get_clusters",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

``` JSON
{
    "name": "get_clusters",
    "ctx": {"cluster_method": "hbdscan"},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

``` JSON
{
    "name": "get_clusters",
    "ctx": {
        "cluster_method": "kmean",
        "n_clusters": 5
        },
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```

## walker get_related_posts

You'll need to run __walker get_clusters__ at least once before running this request.

``` JSON
{
    "name": "get_related_posts",
    "nd": "urn:uuid:7d570cbe-5cb1-428f-9d96-5ced04bce499",
    "ctx": {},
    "_req_ctx": {},
    "snt": "my_sentinel_id",
    "profiling": false,
    "is_async": false
}
```