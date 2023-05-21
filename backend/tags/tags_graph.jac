node tags;

node tag {
    has label;
}

edge parent;
edge child;
edge tag_statement;
edge tag_post {
    has confidence;
}

node statement {
    has text;
}