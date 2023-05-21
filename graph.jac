import {*} with "./posts/posts_graph.jac";
import {*} with "./tags/tags_graph.jac";
import {*} with "./dialog/dialog_graph.jac";
import {*} with "./faq_dialog/faq_dialog_graph.jac";
import {*} with "./preferences/preferences_graph.jac";

node app_root;

graph app_graph {

    has anchor app_root;

    spawn {
        app_root = spawn node::app_root;
        posts = spawn app_root ++> node::posts;
        tags = spawn app_root ++> node::tags;
        sessions = spawn app_root ++> node::sessions;
        dialog_root = spawn app_root ++> node::dialog_root;
        greet = spawn dialog_root +[intent_transition(intent = "greet")]+> node::greet;
        dialog_end = spawn save_probe_dialog ++> node::dialog_end;
    }

}