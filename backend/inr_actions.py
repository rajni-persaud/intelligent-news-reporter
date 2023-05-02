from jaseci.actions.live_actions import jaseci_action
import re
import dateparser
from datetime import date
import requests

@jaseci_action(act_group=["inr"], allow_remote=True)
def remove_html_tags(text: str):

    #remove funny chars that may be there
    ansi_escape = re.compile(r'(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]')
    text = ansi_escape.sub('', text)
    text = re.sub(r"&.*?;", '', text)
    text = text.replace('\\n','')
    #remove html tags
    tags = re.compile('<.*?>')
    return tags.sub('', text)

@jaseci_action(act_group=["inr"], allow_remote=True)
def phrase_to_date(phrase: str):
    _date = dateparser.parse(phrase)
    if(_date):
        return _date.strftime("%Y-%m-%d")
    else: return (date.today()).strftime("%Y-%m-%d")

@jaseci_action(act_group=["inr"], allow_remote=True)
# takes 2 lists and maps creates a dictionary of key:value pairs
def zip_list(d_keys: list, d_values: list):
    if(len(d_keys) == len(d_values)):
        result = {}
        for i in range(len(d_keys)):
            result[d_keys[i]] = d_values[i] 
        return result
    else:
        raise Exception("Both lists must have the same length.")

@jaseci_action(act_group=["inr"], allow_remote=True)
# takes a string (item) and a dictionary; returns all other items with the same value
def get_cluster_list(item: str, clusters: dict):
    cluster_keys = list(clusters.keys())
    cluster_values = list(clusters.values())
    cluster_list = []
    if (item in cluster_keys):
        cluster_value = clusters[item]
        for i in range(len(cluster_keys)):
            if (item != cluster_keys[i] and cluster_values[i] == cluster_value):
                cluster_list.append(cluster_keys[i])
        return cluster_list
    else:
        raise Exception("'{item}' not found in list {list}".format(item=item, list=list(clusters.keys())))
    
@jaseci_action(act_group=["utils"], allow_remote=True)    
def list_to_phrase(lst):
    """
    Formats a list as a phrased list, e.g. ['one', 'two', 'three'] becomes 'one, two and three'.
    """
    if len(lst) == 0:
        return ''
    elif len(lst) == 1:
        return lst[0]
    elif len(lst) == 2:
        return lst[0] + ' and ' + lst[1]
    else:
        return ', '.join(lst[:-1]) + ' and ' + lst[-1]


@jaseci_action(act_group=["utils"], allow_remote=True)  
def replace_placeholders(string_or_collection, placeholders):
    """
    Replaces placeholders delimited by {{ and }} in a string or collection of strings with their corresponding values
    from a dictionary of key-value pairs. If a value in the dictionary is a list, it is formatted as a phrased list.
    Returns only items that have no remaining placeholders.
    Parameters:
    string_or_collection (str or list): A string or collection of strings containing placeholders delimited by {{ and }}.
    placeholders (dict): A dictionary of key-value pairs where the keys correspond to the placeholder names inside the {{ and }}
                          and the values will replace the entire placeholder in the string or collection of strings. If a
                          value in the dictionary is a list, it will be formatted as a phrased list.
    Returns:
    str or list: The input string or collection of strings with the placeholders replaced by their corresponding values.
                 Returns only items that have no remaining placeholders.
    """

    if isinstance(string_or_collection, str):
        # If the input is a string, replace placeholders in that string.
        replaced_string = string_or_collection
        for key, value in placeholders.items():
            if isinstance(value, list):
                value = list_to_phrase(value)
            replaced_string = replaced_string.replace('{{' + key + '}}', str(value))
        if '{{' in replaced_string or '}}' in replaced_string:
            # Return None if the replaced string still contains placeholders.
            return None
        else:
            # Return the replaced string if it has no remaining placeholders.
            return replaced_string

    elif isinstance(string_or_collection, list):
        # If the input is a list, replace placeholders in each string in the list.
        replaced_strings = []
        for string in string_or_collection:
            replaced_string = string
            for key, value in placeholders.items():
                if isinstance(value, list):
                    value = list_to_phrase(value)
                replaced_string = replaced_string.replace('{{' + key + '}}', str(value))
            if '{{' not in replaced_string and '}}' not in replaced_string:
                # Append the replaced string if it has no remaining placeholders.
                replaced_strings.append(replaced_string)
        if len(replaced_strings) > 0:
            # Return the list of replaced strings if there are any that have no remaining placeholders.
            return replaced_strings
        else:
            # Return None if none of the strings in the list have no remaining placeholders.
            return None

    else:
        raise TypeError('Input must be a string or a list of strings.')
    

@jaseci_action(act_group=["inr"], allow_remote=True)    
def get_news_posts(url):
    response = requests.get(url)
    return response.json()['articles']