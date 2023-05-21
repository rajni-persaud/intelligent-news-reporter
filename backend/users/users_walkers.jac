walker get_token {
    master_object = jaseci.master_create(name="rajni");
    report master_object;
}

walker create_user {
    has id;
    has name;
    has email_id;

    root: take --> node::app_root;
    app_root: take --> node::users;

    users {
        take -[users_user(email_id==email_id)]-> node::user else {
            nd = spawn node::user(email_id=email_id);
            here +[users_user(email_id=email_id)]+> nd;
            take --> *nd.info.jid;
        }
    }

    user {
        report here;
    }

}