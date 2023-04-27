import {*} with "./posts/posts_graph.jac";
import {*} with "./tags/tags_graph.jac";
import {*} with "./dialog/dialog_graph.jac";
import {*} with "./faq_dialog/faq_dialog_graph.jac"; 

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
        faqs = spawn dialog_root +[intent_transition(intent= "faqs")]+> node::faqs;
        semantic_search = spawn dialog_root +[intent_transition(intent = "semantic_search")]+> node::semantic_search;
        entity_search = spawn dialog_root +[intent_transition(intent = "entity_search")]+> node::entity_search;
        // list_preferences = spawn dialog_root +[intent_transition(intent = "list_preferences")]+> node::list_preferences;
        add_preferences = spawn dialog_root +[intent_transition(intent = "add_preferences")]+> node::add_preferences;
        update_preferences = spawn dialog_root +[intent_transition(intent = "update_preferences")]+> node::update_preferences;
        confirm_add_preferences = spawn add_preferences +[intent_transition(intent = "positive_confirmation")]+> node::confirm_preferences;
        confirm_update_preferences = spawn update_preferences +[intent_transition(intent = "positive_confirmation")]+> node::confirm_preferences;
        current_preferences = spawn dialog_root +[intent_transition(intent = "current_preferences")]+> node::current_preferences;
        news_feed = spawn dialog_root ++> node::news_feed;
    }

}