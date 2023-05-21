//creates a tag connected to the tags node; 
//and optionally connects it to its parent
walker create_tag {

    has label;
    has parent_jid;

    root: take -->[0];
    app_root: take --> node::tags;

    tags {

        if(!label) {
            report:status = 400;
            report "Missing required parameters";
            disengage;
        }

        // creates tag node
        nd = spawn node::tag(label = label.str::lower);
        // connect it to tags branch node
        here ++> nd;

        // optionally create the edge connected to a specified parent
        if(parent_jid) {
            // from child to parent tag
            nd +[parent]+> *(parent_jid);
            // from parent to child tag
            *(parent_jid) +[child]+> nd;
        }

        report nd;
        disengage;
    }
}


// updates a created tag; 
// nd must be specified along with optional params in the ctx param
walker update_tag {

    has label;

    tag {
        if(label): here.label = label.str::lower;
        report here;
        disengage;
    }
}

// deletes tag node; 
// node jid must be specified in nd param
walker delete_tag {
    tag: report here;
    tag, statement {
        take -->;
        destroy here;
    }
}

// returns tag node; 
// node jid must be specified in nd param
walker get_tag {
   tag {
        report here;
        disengage;
    }

}

// returns all tags
walker list_tags {

    root: take -->[0];
    app_root: take --> node::tags;

    tags {
        report --> node::tag;
        disengage;
    }
}

// creates a statement for a tag; 
// node jid of tag must be specified in nd param
walker add_statement {
    has text;

    tag {
        
        if(!text) {
            report:status = 400;
            report "Missing required parameters";
            disengage;
        }

        nd = spawn node::statement(text = text); // creates node
        here +[tag_statement]+> nd; // creates the edge connected to tag node

        report nd;

        disengage;
    }
}

// returns list of statement node; 
// tag node jid must be specified in nd param
walker list_statements {

    tag {
        report --> node::statement;
        disengage;
    }
}

// updates a statement; 
// nd must be specified along with optional params in the ctx param
walker update_statement {
    has text;

    statement {
        if(text): here.text = text;
        report here;
        disengage;
    }
}

// deletes statement node; 
// node jid must be specified in nd param
walker delete_statement {
    statement {
        report here;
        destroy here;
        disengage;
    }
}

// returns statement node; 
// node jid must be specified in nd param
walker get_statement {
   statement {
        report here;
        disengage;
    }

}

walker import_tag_data {
    has file_path;

    can file.load_json;

    root: take -->[0]; //if at root, walk to app_root node
    app_root: take --> node::tags; //if at app_root, walk to tags node

    tags { //while on the tags node...
        tag_nodes = --> node::tag; //grabs all connected tag nodes connected to 'tags' as a list
        for n in tag_nodes: destroy n; // delete all tag nodes

        try {
            tag_data = file.load_json(file_path); //get list of tags

            for tag_label in tag_data.dict::keys {

                // creates tag with content from JSON
                nd = spawn node::tag(label = tag_label.str::lower);

                // connect the new tag node to the tags node that we're currently on
                here ++> nd;

                // add related statement
                for _statement in tag_data[tag_label] {
                    spawn nd walker::add_statement(text = _statement);
                }

                // return the created node
                report nd;
            }

        } else {
            report:status = 400;
            report "Invalid file path";
            disengage; 
        }
    }
}