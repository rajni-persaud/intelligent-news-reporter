from jaseci.jsorc.live_actions import jaseci_action
import re
import dateparser
from datetime import date
from dateutil.relativedelta import relativedelta

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
