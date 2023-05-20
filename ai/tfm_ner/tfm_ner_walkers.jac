walker tfm_ner_train_model {
    //trains up model, saves then loads it..
    has train_file = global.tfm_ner_training_data;
    has model_path = global.tfm_ner_model_output_path;
    has num_train_epochs = 100;
    has mode = "incremental"; // default, incremental
    can tfm_ner.save_model;
    can tfm_ner.load_model;

    root {
        take --> node::tfm_ner else{
            spawn here ++> node::tfm_ner;
            take --> node::tfm_ner;
        }
    }
    tfm_ner: here::train;

    //save and load after training
    // tfm_ner.save_model(model_path=model_path);
    // tfm_ner.load_model(model_path=model_path);

}

walker tfm_ner_save_model {
    has model_path;
    can tfm_ner.save_model;
    tfm_ner.save_model(model_path=model_path);
}

walker tfm_ner_load_model {
    //loads a trained model from file
    has model_path = global.tfm_ner_model_output_path;
    can tfm_ner.load_model;
    tfm_ner.load_model(model_path=model_path);
}

walker tfm_ner_infer {
    has query, interactive = true;
    has labels, prediction;
    root {
        take --> node::tfm_ner else{
            spawn here ++> node::tfm_ner;
            take --> node::tfm_ner;
        }
    }
    tfm_ner {
        if (interactive) {
            while true {
                query = std.input("Enter input text (Ctrl-C to exit)> ");
                here::infer;
                std.out(prediction);
            }
        } else {
            here::infer;
            report prediction;
        }
    }
}

walker tfm_ner_delete {
    root: take --> node::tfm_ner;
    tfm_ner: destroy here;
}
