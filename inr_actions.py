from jaseci.actions.live_actions import jaseci_action
import re
from datetime import datetime
from datetime import timedelta
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
    today = date.today()
    datephrasefound = {}
    months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ]
    weekdays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    numbers = [
        "31",
        "30",
        "29",
        "28",
        "27",
        "26",
        "25",
        "24",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13",
        "12",
        "11",
        "10",
        "9",
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
        "1",
    ]
    numberwords = [
        "thirty one",
        "thirty",
        "twenty nine",
        "twenty eight",
        "twenty seven",
        "twenty six",
        "twenty five",
        "twenty four",
        "twenty three",
        "twenty two",
        "twenty one",
        "twenty",
        "nineteen",
        "eighteen",
        "seventeen",
        "sixteen",
        "fifteen",
        "fourteen",
        "thirteen",
        "twelve",
        "eleven",
        "ten",
        "nine",
        "eight",
        "seven",
        "six",
        "five",
        "four",
        "three",
        "two",
        "one",
    ]
    slangs = ["month", "week", "day", "yesterday", "today"]
    wordsInPhrase = phrase.split()
    for month in months:
        capital = month.capitalize()
        if month in wordsInPhrase or capital in wordsInPhrase:
            datephrasefound["month"] = month
            break

    for day in weekdays:
        capital = day.capitalize()
        if day in wordsInPhrase or capital in wordsInPhrase:
            datephrasefound["weekDay"] = day
            break

    for (number, numberword) in zip(numbers, numberwords):
        if (
            number in wordsInPhrase
            or numberword in wordsInPhrase
            or phrase.find(number) != -1
        ):
            datephrasefound["number"] = number
            break

    for slang in slangs:
        if slang in wordsInPhrase:
            datephrasefound["slang"] = slang
            break

    if len(datephrasefound) == 1:
        if "month" in datephrasefound:
            firstoffset = (months.index(datephrasefound["month"]) + 1) - today.month
            if firstoffset < 0:
                rdate = today + relativedelta(months=firstoffset)
                return rdate.strftime("%Y-%m-%d")

            else:
                thisyear = today + relativedelta(months=firstoffset)
                rdate = thisyear - relativedelta(years=1)
                return rdate.strftime("%Y-%m-%d")

        elif "weekDay" in datephrasefound:
            firstoffset = (weekdays.index(datephrasefound["weekDay"])) - today.weekday()
            if firstoffset < 0:
                rdate = today + timedelta(days=firstoffset)
                return rdate.strftime("%Y-%m-%d")
            else:
                thisdate = today + timedelta(days=firstoffset)
                rdate = thisdate - timedelta(days=7)
                return rdate.strftime("%Y-%m-%d")

        elif "slang" in datephrasefound:
            if datephrasefound["slang"] == "week":
                rdate = today - timedelta(days=7)
                return rdate.strftime("%Y-%m-%d")
            elif datephrasefound["slang"] == "month":
                rdate = today - relativedelta(months=1)
                return rdate.strftime("%Y-%m-%d")
            elif (
                datephrasefound["slang"] == "day"
                or datephrasefound["slang"] == "yesterday"
            ):
                yesterday = today - timedelta(days=1)
                return yesterday.strftime("%Y-%m-%d")

            elif datephrasefound["slang"] == "today":
                return today.strftime("%Y-%m-%d")
        else:
            return today.strftime("%Y-%m-%d")
    if len(datephrasefound) == 2:
        if "month" in datephrasefound and "number" in datephrasefound:
            firstoffset = (months.index(datephrasefound["month"]) + 1) - today.month
            if firstoffset < 0:
                rdate = datetime(
                    2022,
                    (months.index(datephrasefound["month"]) + 1),
                    int(datephrasefound["number"]),
                )
                return rdate.strftime("%Y-%m-%d")

            else:
                rdate = datetime(
                    2021,
                    (months.index(datephrasefound["month"]) + 1),
                    int(datephrasefound["number"]),
                )
                return rdate.strftime("%Y-%m-%d")

        elif "weekDay" in datephrasefound and "number" in datephrasefound:
            rdate = today
            firstoffset = weekdays.index(datephrasefound["weekDay"]) - rdate.weekday()

            if firstoffset < 0:
                rdate = today + timedelta(days=firstoffset)
            else:
                thisdate = today + timedelta(days=firstoffset)
                rdate = thisdate - timedelta(days=7)
            days = 7 * (int(datephrasefound["number"]) - 1)
            rdate = rdate - timedelta(days=days)

            return rdate.strftime("%Y-%m-%d")

        elif "slang" in datephrasefound and "number" in datephrasefound:
            if datephrasefound["slang"] == "week":
                rdate = today - timedelta(days=7 * int(datephrasefound["number"]))
                return rdate.strftime("%Y-%m-%d")

            elif datephrasefound["slang"] == "month":
                rdate = today - relativedelta(months=1 * int(datephrasefound["number"]))
                return rdate.strftime("%Y-%m-%d")

            elif datephrasefound["slang"] == "day":
                rdate = today - timedelta(days=int(datephrasefound["number"]))
                return rdate.strftime("%Y-%m-%d")

        elif "slang" in datephrasefound and "month" in datephrasefound:
            firstoffset = (months.index(datephrasefound["month"]) + 1) - today.month
            if firstoffset < 0:
                rdate = today + relativedelta(months=firstoffset)
                return rdate.strftime("%Y-%m-%d")

            else:
                thisyear = today + relativedelta(months=firstoffset)
                rdate = thisyear - relativedelta(years=1)
                return rdate.strftime("%Y-%m-%d")

        else:
            return today.strftime("%Y-%m-%d")
    else:
        return today.strftime("%Y-%m-%d")

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
