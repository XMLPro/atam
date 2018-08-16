import requests
import bs4
from http.cookies import SimpleCookie

#%%
cookie_raw = ""
simple_cookie = SimpleCookie()
simple_cookie.load(cookie_raw)
cookie = {k : v.value for k, v in simple_cookie.items()}

csrf_token = None
base_url = "https://beta.atcoder.jp/contests/"
def get_csrf_token(prob, force=False):
    global csrf_token
    if force or csrf_token is None:
        response = requests.get(base_url + prob, cookies=cookie)
        soup = bs4.BeautifulSoup(response.text, "lxml")

        csrf_token = soup.select_one("input[name=csrf_token]")["value"]
    return csrf_token

def submit(prob, prob_number, prob_hard, lang, source_code):
    csrf_token = get_csrf_token(prob)
    url = base_url + "{}{}/submit".format(prob, prob_number)
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
"""

submit(prob, prob_number, prob_hard, lang, source_code)
