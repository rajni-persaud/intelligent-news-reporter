walker update_preferences {

    has updatedNewsSources;
    has updatedInterests;

    root: take --> node::app_root;
    app_root: take --> node::preferences;

    preferences {
        if(updatedNewsSources): here.news_sources = updatedNewsSources;
        if(updatedInterests): here.interest = updatedInterests;
    }
}

walker get_preferences {
    root: take --> node::app_root;
    app_root: take --> node::preferences;
    preferences {
        report here;
        disengage;
    }
}