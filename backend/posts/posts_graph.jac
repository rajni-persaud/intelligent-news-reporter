node posts;
node post {
    has title;
    has description;
    has source;
    has link;
    has image;
    has published;
    has code;
    has summary;
}

edge posts_post {
    has id;
}

edge related;