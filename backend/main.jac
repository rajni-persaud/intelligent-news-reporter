import {*} with "./globals.jac";
import {*} with "./graph.jac";
import {*} with "./posts/posts_walkers.jac";
import {*} with "./tags/tags_walkers.jac";
import {*} with "./dialog/dialog_walkers.jac";
import {*} with "./faq_dialog/faq_dialog_walkers.jac"; 

import {*} with 'ai/tfm_ner/tfm_ner_graph.jac';
import {*} with 'ai/tfm_ner/tfm_ner_walkers.jac';
import {*} with 'ai/use_enc/use_enc_walker.jac';

walker init {

    root {
        take --> node::app_root else { 
            spawn here ++> graph::app_graph;
            spawn here walker::import_faqs(faq_data_url=global.faq_data);
        }
    }
}