walker import_faqs {
    has faq_data_url;

    root: take --> node::app_root;
    app_root : take --> node::dialog_root;
    dialog_root: take --> node::faqs;

    faqs {
        qa = file.load_json(faq_data_url);
        for faq in qa {
            answer = faq["answer"];
            question = faq["question"];
            spawn here +[faq_transition(question=question)]+> node::faq(answer=answer);
        }
    }
}