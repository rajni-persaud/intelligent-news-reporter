walker _text_classify {
    has classify_text = "";
    has classify_list = [];
    has min_confidence = 0;
    has anchor best_result;
    can use.text_classify;

    result = use.text_classify(
        text = classify_text,
        classes = classify_list
    );

    match_index = result['match_idx'];
    confidence = result['scores'][match_index];
    if (confidence > min_confidence) {
        min_confidence = confidence;
        best_result = result.match;
    }
}