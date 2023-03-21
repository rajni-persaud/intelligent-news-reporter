node tfm_ner {
    can tfm_ner.train, tfm_ner.extract_entity;
    can train {
        train_data = file.load_json(visitor.train_file);
        std.log(train_data);
        tfm_ner.train(
            mode = visitor.mode,
            epochs = visitor.num_train_epochs,
            train_data = train_data,
            val_data = train_data
        );
    }
    can infer {
        res = tfm_ner.extract_entity(
            text = visitor.query
        );
        visitor.prediction = res;
    }
}