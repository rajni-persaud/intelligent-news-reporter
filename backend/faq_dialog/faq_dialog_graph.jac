node faqs:dialog_state {
    has name = "faqs";

    // can use.qa_classify;
    // can use.text_classify;

    can prompt with talker entry {}
    can nlu {}
    can process {
        if(!visitor.prev_state): visitor.next_state = (net.root()).info["jid"];
        else: visitor.next_state = visitor.prev_state;
    }
    can nlg {
        ::set_state_response;
    }

    can set_state_response {
        ::get_answer;
        if(!visitor.response): visitor.response = "I'm sorry, I'm unable to answer that.";
    }

    can get_answer { 
        question = "";
        questions = -[faq_transition]->.edge.question;
        min_confidence = global.min_faq_confidence;

        question = spawn here walker::_text_classify(classify_text = visitor.utterance ,classify_list =questions.list, min_confidence=global.min_faq_confidence);

        // chosen_question = use.text_classify(
        //     text = visitor.utterance,
        //     classes = questions.list
        // );

        // match_index = chosen_question['match_idx'];
        // confidence = chosen_question['scores'][match_index];
        // if (confidence > min_confidence) {
        //     min_confidence = confidence;
        //     question = chosen_question.match;
        // }        

        answer = -[faq_transition(question == question)]->.answer;
        visitor._debug.dict::update({"utterance": visitor.utterance ,"answer": answer, "questions": questions});
        if(answer): visitor.response = answer[0];

        visitor._debug.dict::update({"faq_confidence" : min_confidence});
        visitor._debug.dict::update({"predicted_faq" : answer[0]});
    }
}

node faq {
    has name = 'faq';
    has answer;
}

edge faq_transition: has question;