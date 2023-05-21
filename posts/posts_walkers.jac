walker import_news_data {
    has file_path;

    can file.load_json;
    can inr.remove_html_tags;

    root: take -->[0]; //if at root, walk to app_root node
    app_root: take --> node::posts; //if at app_root, walk to posts node

    posts { //while on the posts node...
        post_nodes = --> node::post; //grabs all connected post nodes connected to 'posts' as a list
        for n in post_nodes: destroy n; // delete all post nodes

        try {
            news_posts = file.load_json(file_path); //get list of news posts
            
            for n in news_posts {

                // create post node with content from JSON
                nd = spawn node::post(
                    title = n["title"], 
                    description = inr.remove_html_tags(text = n["description"]), 
                    source = n["source"], 
                    link = n["link"], 
                    image = n["image"], 
                    published = n["published"], 
                    code = n["code"]); 

                //connect the new post node to the posts node that we're currently on
                //with an edge that is described by the id of the posts node
                here +[posts_post(id = nd.info['jid'])]+> nd; 

                //return the created node
                report nd;
            }

        } else {
            report:status = 400;
            report "Invalid file path";
            disengage; 
        }
    }
}


# creates a post node
walker create_post {
    
    has title;
    has description;
    has source;
    has link;
    has image;
    has published;
    has code;

    root: take -->[0];
    app_root: take --> node::posts;

    posts {
        
        if(!title || !description || !source || !published || !code) {
            report:status = 400;
            report "Missing required parameters";
            disengage;
        }

        // creates node
        nd = spawn node::post(
            title = title, 
            description = description, 
            source = source, 
            published = published, 
            code = code);

        if(link): nd.link = link;
        if(image): nd.image = image;

        here +[posts_post(id = nd.info['jid'])]+> nd; // creates the edge connected to posts node

        report nd;

        disengage;
    }

}

#updates a created post; nd must be specified along with optional params in the ctx param
walker update_post {

    has title;
    has description;
    has source;
    has link;
    has image;
    has published;
    has code;

    post {

        if(title): here.title = title;
        if(description): here.description = description;
        if(source): here.source = source;
        if(link): here.link = link;
        if(image): here.image = image;
        if(published): here.published = published;
        if(code): here.code = code;

        report here;
        disengage;
    }

}


# deletes post node; node jid must be specified in nd param
walker delete_post {
    post {
        report here;
        destroy here;
        disengage;
    }
}

#returns post node; node jid must be specified in nd param
walker get_post {
   post {
        report here;
        disengage;
    }

}

walker list_posts {
    has paginated = false;
    has limit = 10;
    has offset = 0;
    
    root: take -->[0];
    app_root: take --> node::posts;
    posts{
        report --> node::post;
        disengage;
    }
}

walker summarize_posts {
    // declare action
    can t5_sum.classify_text;
    has min_len;
    has max_len;

    // head to branch posts node
    root: take -->[0];
    app_root: take --> node::posts;

    posts{
        // grab list of posts
        post_nodes = --> node::post;

        // for each post that doesn't have a summary, generate a summary from the description and save it in summary attribute
        for n in post_nodes {
            if(!n.summary): n.summary = t5_sum.classify_text(text = n.description, min_length = min_len, max_length = max_len);
            std.log(n.summary);
            report n;
        }
        disengage;
    }
}

// walk through all posts,
// for each post, identify which tags are applicable and establish edges between them
walker tag_posts {

    root: take --> node::app_root;
    app_root: take --> node::posts;

    posts {
        take --> node::post;
    }

    post {
        spawn here walker::apply_tags;
    }
}

// takes a post and applies the best tags to it
walker apply_tags {

    can use.text_classify;
    has min_confidence = 0.1;
    has _post;

    root: take --> node::app_root;
    app_root: take --> node::tags;

    post {
        _post = here;
        std.log("grabbed post node: " + _post.title);
        take net.root(); //head back to root
    }

    tags {
        take --> node::tag;
    }

    tag {
        std.log("examining tag: " + here.label);

        result = use.text_classify(
            text = _post.title,
            classes = -[tag_statement]->.text // pluck text value from nodes connected by tag_statement edges as list
        );

        // grab index of match with highest score
        match_index = result["match_idx"];
        // grab the score
        confidence = result["scores"][match_index];

        // if it makes our acceptance confidence level, we consider it
        if (confidence >= min_confidence) {

            //establish the edge, if it doesnt exist
            if( _post in <-[tag_post]-> ): std.log("already added tag: " + here.label);
            else: _post <+[tag_post(confidence = confidence)]+> here;

        } else {
            std.log("confidence too low, skipping");
        }
    }
}


walker semantic_search {
    has query;
    has min_confidence = 0.15;

    can use.qa_similarity;

    root: take --> node::app_root;
    app_root: take --> node::posts;

    posts {
        
        if(!query) {
            report:status = 400;
            report "Missing required parameter";
            disengage;
        }

        take --> node::post;
    }

    post {
        cos_score = use.qa_similarity(text1 = here.summary, text2 = query);
        if(cos_score >= min_confidence) {
            report {"score": cos_score, "post": here};
        }
    }
 
}

// extract entities from query inputted by user
walker entity_search {
    has utterance;
    has entities = {};

    can extract_entities {
        
        try {
            entity_config = file.load_json(global.entity_config);
        } else {
            std.log("Could not load entity list.");
        }

        if(entity_config) {
            res = tfm_ner.extract_entity(visitor.utterance);

            //prepare a standard way of organizing extracted entities inside of the walker
            //this can be modified if we swap out the NER without altering dependencies in the implementing app
            if(res.type == list || res.type == dict) {
                for entity in res {
                    if(entity["conf_score"] >= global.min_ner_confidence) {
                        entity_label = entity["entity_value"];
                        entity_text = entity["entity_text"];
                        entity_confidence = entity["conf_score"];
                                                
                        if(entity_label in entity_config["labels"]) { 
                            //only consider valid entities based on entity_config.json
                            //update the collection of entities in the walker, 
                            //appending new entity_texts to existing entity_labels
                            if(entity_label not in entities) {
                                entities[entity_label] = [{"text": entity_text, "confidence":entity_confidence}];
                            } else {
                                texts = entities[entity_label];

                                for item in texts {   
                                    if(entity_text not in item["text"]) {
                                        entities[entity_label] += [{"text":entity_text, "confidence":entity_confidence}]; 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }      

    }

    // extract entities then we filter posts and report...
    ::extract_entities;
    report spawn net.root() walker::filter_posts_by_entities(entities = entities);
}

walker filter_posts_by_entities {
    has entities;
    has anchor _posts = [];

    has min_confidence = 0.15;
    can use.qa_similarity;

    if(entities) {
        root: take -->[0];
        app_root {
            // if tag is extracted, go to tags node; else go to posts node
            if ("tag" in entities.dict::keys): take --> node::tags;
            else: take --> node::posts;
        }

        tags {  // while on tags node...
            tag_labels = -->.label;
            for extracted_tag in entities["tag"] {
                std.log("extracted tag: "+extracted_tag["text"]);
                // if extracted tag matches the label of any tag then go to that tag node
                if (extracted_tag["text"] in tag_labels){
                    take --> node::tag(label == extracted_tag["text"]);
                }
                // else spawan walker to get a similar tag
                else {
                    std.log("looking for a similar tag related to: "+extracted_tag["text"]);
                    similar_tag = spawn here walker::get_similar_tag(extracted_tag=extracted_tag["text"], entities=entities);
                    if(similar_tag) {
                        std.log("found similar tag: "+ similar_tag +" to:"+ extracted_tag["text"]);
                        take --> node::tag(label == similar_tag);
                    }
                }
            }
            
        }

        posts {
            take --> node::post;
        }

        tag { // while on tag node go to every post connected to this tag
            std.log("getting posts connected to "+here.label+" tag node");
            take <-[tag_post]-> node::post;
        }

        post {
            // if we're here, we've found a narrowed-down post, let's add it
            _posts += spawn here walker::apply_post_filter(entities=entities);
        }
    }
}

// gets a similar tag related to the extracted tag
walker get_similar_tag {
    has extracted_tag;
    has entities;
    has anchor similar_tag;

    min_score = 0.15;

    take --> node::tag;

    tag {
        std.log("examining tag: "+here.label);

        cos_score = use.qa_similarity(text1 = here.label, text2 = extracted_tag);

        if (cos_score >= min_score) {
            similar_tag = here.label;
        }
    }
}

walker apply_post_filter {
    can inr.phrase_to_date;
    has entities;
    has anchor _posts = [];

    post {

        entity_labels = entities.dict::keys;

        std.log("checking post: "+here.title);

        // checking for news source, timestamp_start, timestamp_end
        if ("news_source" in entity_labels and "timestamp_start" in entity_labels and "timestamp_end" in entity_labels) {
            start_date = inr.phrase_to_date(entities["timestamp_start"][0]["text"]);
            end_date = inr.phrase_to_date(entities["timestamp_end"][0]["text"]);
            for news_source in entities["news_source"] {
                if (news_source["text"] == (here.source).str::lower
                    and (date.date_day_diff(start_date, here.published) >= 0) 
                    and (date.date_day_diff(here.published, end_date) >= 0)){
                    _posts += [here];
                }
            }
        }
        // checking for news source, timestamp
        elif ("news_source" in entity_labels and "timestamp" in entity_labels) {
            date_published = inr.phrase_to_date(entities["timestamp"][0]["text"]);
            for news_source in entities["news_source"] {
                if (news_source["text"] == (here.source).str::lower and date_published in here.published){
                    _posts += [here];
                }
            }
        }
        // checking for timestamp_start, timestamp_end
        elif ("timestamp_start" in entity_labels and "timestamp_end" in entity_labels) {
            start_date = inr.phrase_to_date(entities["timestamp_start"][0]["text"]);
            end_date = inr.phrase_to_date(entities["timestamp_end"][0]["text"]);
            if ( (date.date_day_diff(start_date, here.published) >= 0) 
            and (date.date_day_diff(here.published, end_date) >= 0)){
                _posts += [here];
            }
        }
        // checking for timestamp only
        elif ("timestamp" in entity_labels) {
            date_published = inr.phrase_to_date(entities["timestamp"][0]["text"]);
            std.log(date_published);
            if ( (date.date_day_diff(date_published, here.published) >= 0)) {
                _posts += [here];
            }
        }
        // checking for news_source only
        elif ("news_source" in entities.dict::keys) {
            for extracted_source in entities["news_source"] {
                std.log("extracted news source: "+extracted_source["text"]);
                if (extracted_source["text"] == (here.source).str::lower){
                    _posts += [here];
                }
            }
        }
        else {
            _posts += [here];
        }
    }
}

// does dimensionality reduction after 512 dimension embeddings are produced

walker do_umap {
    can use.encode;
    can cluster.get_umap;
    
    has list_of_text;
    has anchor embeddings;
    
    //params: embeddings, neighbors, min_dist, n_components, metric
    //read more here: https://umap-learn.readthedocs.io/en/latest/parameters.html
    
    embeddings = cluster.get_umap(use.encode(list_of_text),15, 0.1, 2, 42);

}

// allows you to generate hbdscan clusters based on the umap embeddings

walker get_hdbscan_clusters {
    has umap_embeddings;
    
    can cluster.get_cluster_labels;
    can use.encode;
    
    has anchor clusters;
    
    clusters = cluster.get_cluster_labels(umap_embeddings,"hbdscan",2,2);

}

// allows you to generate kmeans clusters based on the umap embeddings

walker get_kmeans_clusters {
    has umap_embeddings;
    
    can use.encode;
    
    has anchor clusters;
    
    clusters = cluster.get_cluster_labels(umap_embeddings,"kmeans",2,2, n_clusters);

}

// connects related posts

walker relate_posts {
    has clusters;
    has cluster_method = "hdbscan";
    has n_clusters = 3;
    
    can inr.zip_list, inr.get_cluster_list;
    
    root: take -->[0];
    app_root: take --> node::posts;

    posts { // while on posts node ...
        if((-[posts_post]->).length > 0){ // check if there are posts
            list_of_summaries = -[posts_post]->.summary; // plucks a list of summary values fom nodes
            
            // getting a list of post node jid
            posts_jid = -[posts_post]->.edge.id;
            
            // creates a list of embeddings using posts summary
            umap_embeddings = spawn here walker::do_umap(list_of_text=list_of_summaries);
            
            // generates hdbscan clusters based on umap embeddings
            if (cluster_method == "hdbscan") {
                hdbscan_data = spawn here walker::get_hdbscan_clusters(umap_embeddings=umap_embeddings);
                clusters = inr.zip_list(d_keys=posts_jid, d_values=hdbscan_data);
            }
            
            // generates kmeans clusters based on umap embeddings
            elif (cluster_method == "kmeans"){
                kmeans_data = spawn here walker::get_kmeans_clusters(umap_embeddings=umap_embeddings, n_clusters=n_clusters);
                clusters = inr.zip_list(d_keys=posts_jid, d_values=kmeans_data);
            }
            else{
                report "cluster_method must be either 'hdbscan' or 'kmeans'.";
                disengage;
            }
            
            std.log(clusters);
            take -->;
        }
        else { // if no post exist...
            report "No posts found! Please create or import a post.";
            disengage;
        }

    }

    post {
        // remove any pre-existing post relationships
        !-[related]-> node::post;

        std.log("examining posts related to: "+here.title);

        // grabs list of jids related to this post
        related_jids = inr.get_cluster_list(item=here.info['jid'], clusters=clusters);

        if (related_jids.length > 0) {

            for i in related_jids {

                if( *i in (-[related]->)) {
                    std.log("already connected to: "+ i);
                }
                
                else {
                    here <+[related]+>*i;
                    std.log("connecting to: "+ i);
                }

            }

        }

        else {
            std.log("no post related to "+here.title);
        }

    }
}




walker get_related_posts {
    
    post {
        report -[related]-> node::post;
    }
}



walker classify_intent {
    has utterance;
    has anchor intent = "";
    can use.text_classify;

    try {
        intent_data = file.load_json(global.intent_data);
    } else {
        std.log("Could not load intent data.");
    }

    if(intent_data) {
        min_confidence = global.min_intent_confidence;

        for item in intent_data {

            statements = intent_data[item];

            predicted_intent = use.text_classify(
                text = utterance,
                classes = statements.list
            );

            match_index = predicted_intent['match_idx'];
            confidence = predicted_intent['scores'][match_index];
            if (confidence >= min_confidence) {
                min_confidence = confidence;
                intent = item;
            }
        }
    }

    report intent;
}


walker interact {
    has utterance;
    has intent;

    if(!utterance) {
        report:status = 400;
        report "Missing required parameter";
        disengage;
    }

    intent = spawn here walker::classify_intent(utterance=utterance);

    if(!intent) {
        report "No intent found";
        disengage;
    }

    std.log("Intent: "+ intent);

    if(intent == "semantic_search") {
        spawn here walker::semantic_search(query=query);
    }
    elif(intent == "entity_search") {
        spawn here walker::entity_search(query=query);
    }
    else {
        report intent;
    }

}