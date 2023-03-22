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

    root: take -->[0];
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
    has min_confidence = 0.15;
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
            text = _post.summary,
            classes = -[tag_statement]->.text //pluck text value from nodes connected by tag_statement edges as list
        );
        //grab index of match with highest score
        match_index = result['match_idx'];
        //grab the score
        confidence = result['scores'][match_index];
        //if it makes our acceptable confidence level, we consider it
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

    root: take -->[0];
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
walker query_entities {
    has utterance;
    has anchor entities = {};

    can extract_entities {
        
        try {
            entity_list = file.load_json(global.entity_list);
        } else {
            std.log("Could not load entity list.");
        }

        if(entity_list) {
            res = tfm_ner.extract_entity(utterance);

            //prepare a standard way of organizing extracted entities inside of the walker
            //this can be modified if we swap out the NER without altering dependencies in the implementing app
            if(res.type == list || res.type == dict) {
                for entity in res {
                    if(entity["conf_score"] >= global.min_ner_confidence) {
                        entity_label = entity["entity_value"];
                        entity_text = entity["entity_text"];
                        entity_confidence = entity["conf_score"];
                        
                        if(entity_label in entity_list) { 
                            //only consider valid entities based on entity_list.json
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

    ::extract_entities;
}

// gets a similar tag related to the extracted tag
walker get_similar_tag {
    has extracted_tag;
    has entities;

    has anchor similar_tag;

    max_score = 0;

    take --> node::tag;

    tag {
        std.log("examining tag: "+here.label);

        cos_score = use.qa_similarity(text1 = here.label, text2 = extracted_tag);

        if (cos_score > max_score) {
            max_score = cos_score;
            similar_tag = here.label;
        }
    }
}

walker apply_tag_filter {
    has query;
    has entities;

    has min_confidence = 0.15;
    can use.qa_similarity;

    entities = spawn here walker::query_entities(utterance=query);
    std.log(entities);

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
                std.log("found similar tag: "+ similar_tag);
                take --> node::tag(label == similar_tag);
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
        spawn here walker::apply_post_filter(entities=entities);
    }
}

walker apply_post_filter {
    can inr.phrase_to_date;
    has entities;

    post {

        entities_extracted = entities.dict::keys;

        std.log("checking post: "+here.title);

        // checking for news source, timestamp_start, timestamp_end
        if ("news_source" in entities_extracted && "timestamp_start" in entities_extracted && "timestamp_end" in entities_extracted) {
            start_date = inr.phrase_to_date(entities["timestamp_start"][0]["text"]);
            end_date = inr.phrase_to_date(entities["timestamp_end"][0]["text"]);
            for extracted_source in entities["news_source"] {
                if (extracted_source["text"] == (here.source).str::lower && (date.date_day_diff(start_date, here.published) >= 0) && (date.date_day_diff(here.published, end_date) >= 0)){
                    report here;
                }
            }
        }
        // checking for news source, timestamp
        elif ("news_source" in entities_extracted && "timestamp" in entities_extracted) {
            date_published = inr.phrase_to_date(entities["timestamp"][0]["text"]);
            for extracted_source in entities["news_source"] {
                if (extracted_source["text"] == (here.source).str::lower && date_published in here.published){
                    report here;
                }
            }
        }
        // checking for timestamp_start, timestamp_end
        elif ("timestamp_start" in entities_extracted && "timestamp_end" in entities_extracted) {
            start_date = inr.phrase_to_date(entities["timestamp_start"][0]["text"]);
            end_date = inr.phrase_to_date(entities["timestamp_end"][0]["text"]);
            if ((date.date_day_diff(start_date, here.published) >= 0) && (date.date_day_diff(here.published, end_date) >= 0)){
                report here;
            }
        }
        // checking for timestamp only
        elif ("timestamp" in entities_extracted) {
            date_published = inr.phrase_to_date(entities["timestamp"][0]["text"]);
            if (date_published in here.published){
                report here;
            }
        }
        // checking for news_source only
        elif ("news_source" in entities.dict::keys) {
            for extracted_source in entities["news_source"] {
                std.log("extracted news source: "+extracted_source["text"]);
                if (extracted_source["text"] == (here.source).str::lower){
                    report here;
                }
            }
        }
        else {
            report here;
        }
    }
}

// generates the embeddings for an array of text
walker umap_cluster {
    can use.encode;
    can cluster.get_umap;

    has list_of_text;
    has anchor embeddings;

    embeddings = cluster.get_umap(use.encode(list_of_text),15, 0.1, 2, 42);
}

// allows you to generate hbdscan clusters based on the umap embeddings
walker hbdscan_clusterings {
    can cluster.get_cluster_labels;
    can cluster.get_umap;
    can use.encode;

    has umap_embeddings;
    has anchor clusters;

    clusters = cluster.get_cluster_labels(umap_embeddings,"hbdscan",2,2); 
}

// allows you to generate kmeans clusters based on the umap embeddings
walker kmean_clusterings {
    can cluster.get_umap;
    can use.encode;

    has umap_embeddings;
    has anchor clusters;

    clusters = cluster.get_cluster_labels(umap_embeddings,"kmeans",2,2, n_clusters);
}

// connects related posts
walker get_clusters {
    has clusters;
    has cluster_method = "hbdscan";
    has n_clusters = 3;

    can inr.zip_list, inr.get_cluster_list;

    root: take -->[0];
    app_root: take --> node::posts;
    posts{ // while on posts node ...
        if((-[posts_post]->).length > 0){   // check if there is post
            list_of_summary = -[posts_post]->.summary; // plucks a list of summary values fom nodes
            // getting a list of post node jid
            posts_jid = -[posts_post]->.edge.id;
            // creates a list of embeddings using posts summary
            umap_embeddings = spawn here walker::umap_cluster(list_of_text=list_of_summary);
            // generates hbd clusters based on umap embeddings
            if (cluster_method == "hbdscan") {
                hdb_data = spawn here walker::hbdscan_clusterings(umap_embeddings=umap_embeddings);
                clusters = inr.zip_list(d_keys=posts_jid, d_values=hdb_data);
            }
            // generates kmeans clusters based on umap embeddings
            elif (cluster_method == "kmean"){
                kmean_data = spawn here walker::kmean_clusterings(umap_embeddings=umap_embeddings, n_clusters=n_clusters);
                clusters = inr.zip_list(d_keys=posts_jid, d_values=kmean_data);
            }
            else{
                report "cluster_method must be either 'hbdscan' or 'kmean'.";
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
        std.log("examining posts related to: "+here.title);
        // grabs list of jids related to this post 
        related_jid = inr.get_cluster_list(item=here.info['jid'], clusters=clusters);
        if (related_jid.length > 0) {
            for i in related_jid {
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