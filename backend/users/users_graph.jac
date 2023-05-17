node users;
node user {
    has id;
    has name;
    has email_id;
    has preferences;
    has session_id;
}

edge users_user {
    has email_id;
}