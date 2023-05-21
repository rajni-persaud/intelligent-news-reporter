node dialog_state {

    can use.text_classify;
    can tfm_ner.extract_entity;
    can sentiment.predict;
    can utils.replace_word;

    has name;

    can nlu {
        ::classify_intent;
        ::extract_entities;
        ::analyze_sentiment;
    }

    can process {}

    can nlg {}

    can cleanup with talker exit {}

    can resume {}

    can get_session {
        if(!visitor.resumed) {
            if(visitor.session_id): _session = spawn net.root() walker::load_user_session(session_id = visitor.session_id);
            else: _session = spawn net.root() walker::load_user_session;

            visitor.session_id = _session.session_id;
            if(_session.session_data) {
                for item in _session.session_data.dict::keys {
                    if(item != "utterance"): visitor.context[item] = _session.session_data[item];
                }
            }  
            visitor.resumed = true;
        }
    }

    can set_session {
        if(visitor.session_id): spawn net.root() walker::save_user_session(session_id = visitor.session_id, session_data = visitor.context);
    }

    can classify_intent { 

        intent = "";
        //grab all the available intent labels
        intent_labels = -[intent_transition]->.edge.intent;
        
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
                    text = visitor.utterance,
                    classes = statements.list
                );

                match_index = predicted_intent['match_idx'];
                confidence = predicted_intent['scores'][match_index];
                if (confidence > min_confidence) {
                    min_confidence = confidence;
                    intent = item;
                }                
            }
        }    
        visitor._debug.dict::update({"intent_confidence" : min_confidence});
        visitor._debug.dict::update({"predicted_intent" : intent});
            
        if(intent in intent_labels): visitor.intent = intent;
        
    }

    can extract_entities {
        
        try {
            entity_config = file.load_json(global.entity_config);
        } else {
            std.log("Could not load entity list.");
        }

        if(entity_config) {
            res = tfm_ner.extract_entity(visitor.utterance);
            visitor._debug.dict::update({"extracted_entities" : res});
            std.out(res);

            //prepare a standard way of organizing extracted entities inside of the walker
            //this can be modified if we swap out the NER without altering dependencies in the implementing app
            if(res.type == list || res.type == dict) {
                for entity in res {
                    if(entity["conf_score"] >= global.min_ner_confidence and entity['entity_text'] not in entity_config["ignore"]) {
                        lis = ['u','i','U','I'];
                        // if(entity['entity_text'] in lis or entity['entity_text'].list.length > 1){

                            entity_label = entity["entity_value"];
                            entity_text = entity["entity_text"];
                            entity_confidence = entity["conf_score"];

                            //perform entity text replacements
                            if(entity_text in (entity_config["replace"]).dict::keys): entity_text = entity_config["replace"][entity_text];
                            if("convert" in entity_config) {
                                for text in (entity_config["convert"]).dict::keys {
                                    entity_text = utils.replace_word(entity_text, text, entity_config["convert"][text]);
                                }
                            }
                                                    
                            if(entity_label in entity_config["labels"]) { 
                                //only consider valid entities based on entity_config.json
                                //update the collection of entities in the walker, 
                                //appending new entity_texts to existing entity_labels
                                if(entity_label not in visitor.entity_data) {
                                    visitor.entities[entity_label] = [entity_text];
                                    visitor.entity_data[entity_label] = [{"text": entity_text, "confidence":entity_confidence}];
                                } else {
                                    //we already have items under the label, ensure we only add unique items..
                                    if(entity_text not in visitor.entities[entity_label]) {
                                        visitor.entities[entity_label] += [entity_text]; 
                                        visitor.entity_data[entity_label] += [{"text":entity_text, "confidence":entity_confidence}]; 
                                    }                                
                                }
                            }
                        // }
                    }
                }
            }
        }     

    }

    can analyze_sentiment {

        //run sentiment analysis on utterance
        
        sentiment_classes = {
            "POS": "positive",
            "NEG": "negative",
            "NEU": "neutral"
        };
        //establish default sentiment
        sentiment_result = "neutral";
        
        sentiment_data = sentiment.predict([visitor.utterance]);
        visitor._debug.dict::update({"sentiment_data" : sentiment_data});
        
        //parse and standardize sentiment data {class,confidence}
        if(sentiment_data) {
            item = sentiment_data[0];
            if( item["score"] >= global.min_sentiment_confidence ) {
                sentiment_result = sentiment_classes[item["label"]];
            }
        }

        visitor.sentiment = sentiment_result;

    }

    can set_state_response {
        //returns a random state response based on ext json file and exclude list
        exclude = [];
        try {
            state_responses = file.load_json(global.state_responses);
        } else {
            std.log("Could not load state responses.");
        }
        
        if(state_responses) {
            if(name in state_responses) {
                responses = state_responses[name];
                visitor.response = rand.choice(responses);
            } else {
                visitor.response = "Unfortunately, I don't have a response for that";
            }
        } else {
            visitor.response = "Unfortunately, I am unable to continue.";
        }

       
    }

}

node dialog_root:dialog_state {
    has name = "dialog_root";

    can resume {
        ::get_session;
    }

    can process {
        next_node = (-[intent_transition(intent==visitor.intent)]-> node::dialog_state);
        if(next_node) {
            visitor.next_state = next_node[0].info["jid"];
        }
        else: visitor.next_state = (net.root()).info["jid"];
    }

    can nlg {
        if(!visitor.intent): ::set_state_response;
    }
}

node greet:dialog_state {
    has name = "greet";

    can process {
        visitor.next_state = (net.root()).info["jid"];
    }

    can nlg {
        ::set_state_response;
    }
}

node dialog_end:dialog_state {
    has name = "dialog_end";
    //the talker walker disengages when it gets here
}

edge intent_transition {
    has intent;
}

node sessions;

node session {
    has session_id;
    has session_data = {};
}