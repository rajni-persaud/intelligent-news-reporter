import {*} with "./posts/posts_graph.jac";
import {*} with "./tags/tags_graph.jac";

node app_root;

graph app_graph {

    has anchor app_root;

    spawn {
        app_root = spawn node::app_root;
        posts = spawn app_root ++> node::posts;
        tags = spawn app_root ++> node::tags;
    }

}