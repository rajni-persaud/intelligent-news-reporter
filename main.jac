import {*} with "./globals.jac";

import {*} with "./graph.jac";
import {*} with "./posts/posts_walkers.jac";
import {*} with "./tags/tags_walkers.jac";

import {*} with 'ai/tfm_ner/tfm_ner_graph.jac';
import {*} with 'ai/tfm_ner/tfm_ner_walkers.jac';

walker init {

    root {
        take --> node::app_root else { spawn here ++> graph::app_graph; }
    }
}