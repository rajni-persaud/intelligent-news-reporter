walker talker {

    has session_id;
    has utterance;
    has anchor response = "";
    has last_response = "";
    has intent;
    has entities = {};
    has entity_data = {};
    has sentiment;
    has prev_state;
    has next_state;
    has resumed = false;
    has verbose = false;
    has _context = {};
    has _debug = {
        "transcript": [],
        "trail": []
    };
    has memory_id = "";

    can clear_state {
        if(utterance): _debug["transcript"] += [{"utterance":utterance}];
        if(response) {
            _debug["transcript"] += [{"response":response}];
            last_response = response;
        } 
        response = "";
        intent = null;
        sentiment = "";
        entity_data = {};
        resumed = false;
    }   

    root: take --> node::app_root;
    app_root : take --> node::dialog_root;

    dialog_state {
        
        if(utterance): here::nlu;
        here::process;
        here::nlg;
        here::resume; //resume from previous walk
        
        if(response) {
            // std.out(_context["probe_entity"]);
            if("probe_entity" not in _context): _context["probe_entity"]='';

            if(verbose) {
                payload = {
                    "session_id": session_id,
                    "utterance": utterance,
                    "intent": intent,
                    "sentiment": sentiment,
                    "entity_data": entity_data,
                    "context": _context,
                    "next_state": next_state,
                    "prev_state": prev_state,
                    "debug": _debug,
                    "response": response,
                    "memory_id": memory_id,
                    "probe_entity": _context['probe_entity']
                };
            } else {
                payload = {
                    "session_id": session_id,
                    "utterance": utterance,
                    "response": response,
                    "memory_id": memory_id,
                    "probe_entity": _context['probe_entity']
                };
            }
            
            report payload;
            ::clear_state;
            here::set_session;
            disengage;
        } 
        
        if(next_state) {
            next_node = *(next_state);
            take next_node;
            prev_state = here.info["jid"];
            next_state = null;
        } 

        _debug["trail"] += [here.name]; //update the trail 
    }

    dialog_end {
        disengage;
    }  
    
}

walker load_user_session {
    has session_id;
    has anchor session_data = {};

    root: take --> node::app_root;
    app_root: take --> node::sessions;

    sessions {

         _session = --> node::session(session_id == session_id);
        
        if(!_session) {
             _session = spawn here ++> node::session;
             //generate session_id if not provided...
             if(!session_id): _session.session_id = _session.info["jid"];
             else: _session.session_id = session_id;
        }

        take _session;
        
    }

    session {
        session_data = here.context;
        disengage;
    }
}

walker save_user_session {
    has session_id;
    has session_data = {};

    root: take --> node::app_root;
    app_root: take --> node::sessions;

    sessions {
        take --> node::session(session_id == session_id) else: disengage;
    }

    session {
        here.session_data = session_data;
        disengage;
    }
}

walker clear_user_session {
    has session_id;

    root: take --> node::app_root;
    app_root: take --> node::sessions;

    sessions {
        take --> node::session(session_id == session_id) else: disengage;
    }

    session {
        destroy here;
        disengage;
    }
}

//very dangerous..only for development
walker wipe_sessions {
    root: take --> node::app_root;
    app_root: take --> node::sessions;

    sessions {
        take --> node::session;
    }

    session {
        destroy here;
    }
}



walker collect_info{
    has anchor _context;
    has lis =[];
    root: take -->[0];
    app_root: take --> node::sessions;
    sessions{
        _context = -->.session_data;
        
        for i in _context{
            lis.list::append(i['_debug']['transcript']);
        }
        report lis;
    }
}