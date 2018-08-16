import requests
import bs4

#%%
cookie = {
}

csrf_token = None
def get_csrf_token(force=False):
    global csrf_token
    if force or csrf_token is None:
        response = requests.get(headers["referer"], cookies=cookie)
        soup = bs4.BeautifulSoup(response.text, "lxml")

        csrf_token = soup.select_one("input[name=csrf_token]")["value"]
    return csrf_token

def submit(prob, prob_number, prob_hard, lang, source_code):
    csrf_token = get_csrf_token()
    url = "https://beta.atcoder.jp/contests/{}{}/submit".format(prob, prob_number)
    data = {
        "data.TaskScreenName": "{}{}_{}".format(prob, prob_number, prob_hard),
        "data.LanguageId": lang,
        "sourceCode": source_code,
        "csrf_token": csrf_token,
    }

    return requests.post(url, data=data, cookies=cookie)

#%%
prob = "abc"
prob_number = "099"
prob_hard = "a"
lang = "3023"

source_code = """
print("ABC" if int(input()) < 1000 else "ABD")
"""

submit(prob, prob_number, prob_hard, lang, source_code)
