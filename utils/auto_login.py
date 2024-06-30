import requests
import sys
import json

LOGIN, PASSWORD = sys.argv[1].split(":")


def get_app_token():
    token_response = requests.post(f"https://api-user.huami.com/registrations/{LOGIN}/tokens",
                                   headers={
                                       "app_name": "com.huami.zeppos.cli",
                                       "Content-Type": "application/x-www-form-urlencoded"
                                   },
                                   data={
                                       "client_id": "HuaMi",
                                       "country_code": "US",
                                       "json_response": "true",
                                       "name": LOGIN,
                                       "password": PASSWORD,
                                       "redirect_uri": "https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html",
                                       "state": "REDIRECTION",
                                       "token": "access"
                                   }).json()
    login_response = requests.post("https://account.huami.com/v2/client/login",
                                   headers={
                                       "Content-Type": "application/x-www-form-urlencoded"
                                   },
                                   data={
                                       "allow_registration": "false",
                                       "app_name": "com.huami.zeppos.cli",
                                       "app_version": "4.3.0",
                                       "code": token_response["access"],
                                       "country_code": token_response["country_code"],
                                       "device_id": "02:00:00:00:00:00",
                                       "device_model": "web",
                                       "dn": "account.huami.com,api-user.huami.com,auth.huami.com,api-mifit.huami.com,api-open.huami.com",
                                       "grant_type": "access_token",
                                       "third_name": "huami"
                                   }).json()

    return login_response["token_info"]


if __name__ == "__main__":
    data = get_app_token()
    with open("test_auth.json", "w") as f:
        f.write(json.dumps(data))
