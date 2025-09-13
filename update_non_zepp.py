import sys
import json
import time

import requests

from pathlib import Path
from urllib.parse import urlencode
from rich import print as pprint

TOKEN_PATH = Path('./auth_data.json')
ZEUS_DEVICES_URL = "https://upload-cdn.zepp.com/zeppos/devkit/zeus/devices.json"

PRODUCTION_ID_RANGE = [240, 270]

ZEPP_VERSION = "9.11.1-play_151669"
ZEPP_USER_AGENT = f"Zepp/{ZEPP_VERSION.split('_')[0]} (2203129G; Android 14; Density/2.75)"
ZEPP_VERSION_IV = "_".join(list(ZEPP_VERSION.split("_")[::-1]))

FETCH_FW_HEADERS = {
    'vn': ZEPP_VERSION.split("_")[0],
    'cv': ZEPP_VERSION_IV,
    'user-agent': ZEPP_USER_AGENT,
    'appname': 'com.huami.midong',
    'appplatform': 'android_phone',
    'channel': 'play',
    'country': 'US',
    'hm-privacy-ceip': 'false',
    'hm-privacy-diagnostics': 'false',
    'lang': 'en_US',
    'timezone': 'Asia/Krasnoyarsk',
    'v': '2.0',
}

FETCH_FW_QUERY_ARGS = {
    'appVersion': ZEPP_VERSION,
    'cv': ZEPP_VERSION_IV,
    'channel': 'play',
    'country': 'US',
    'device': 'android_35',
    'deviceType': 'ALL',
    'device_type': 'android_phone',
    'diagnosticCode': '1',
    'firmwareFlag': '-1',
    'firmwareVersion': '0',
    'fontFlag': '0',
    'fontVersion': '0',
    'gpsVersion': '0',
    'hardwareVersion': '0',
    'lang': 'en_US',
    'productId': '0',
    'resourceFlag': '-1',
    'resourceVersion': '-1',
    'support8Bytes': 'true',
    'timezone': 'Asia/Krasnoyarsk',
    'v': '2.0',
    'vendorSource': '1'
}

def ver2int(v: str):
    return int(v.replace(".", ""))


def ask(question, options):
    ret = ''
    optstr = '' if options is None else ",".join(options)
    while (options is not None and ret not in options) or ret == '':
        print(f'     {question} [{optstr}]? ', end='')
        ret = input()
    return ret


def get_with_retries(*args, **kwargs):
    retries = 0
    while retries < 3:
        # noinspection PyBroadException
        try:
            return requests.get(*args, **kwargs, timeout=10)
        except Exception:
            time.sleep(1)
            continue
    raise Exception("Request failed after 3 retires")


def fetch_top(auth: dict, app: str, device_source: str, entry_type: str, page=1):
    response = get_with_retries(f"https://api.amazfit.com/market/devices/"
                                f"{device_source}/{entry_type}/apps"
                                f"?page={page}"
                                f"&per_page=15"
                                f"&userid={auth['user_id']}"
                                f"&user_country=RU"
                                f"&api_level=305",
                                headers={
                                    "apptoken": auth['app_token'],
                                    "Country": "RU",
                                    "appplatform": "android_phone",
                                    "appname": app,
                                    "hm-privacy-diagnostics": "false",
                                    "cv": ZEPP_VERSION_IV,
                                })
    data = response.json()
    if response.status_code != 200:
        raise Exception(f"Can't fetch app list: {data}")

    return data["data"]

def fetch_latest_release(device, production, application):
    base = "https://api-mifit-cn3.zepp.com/devices/ALL/hasNewVersion"
    query = urlencode({
        **FETCH_FW_QUERY_ARGS,
        'deviceSource': device,
        'productionSource': production,
    })

    return get_with_retries(
        f"{base}?{query}",
        headers={
            **FETCH_FW_HEADERS,
            "appname": application
        }
    ).json()



# -------------------------------------------------
#                   Prepare
# -------------------------------------------------

pprint('[==] Parsing existing data...')
with open("non_zepp_devices.json", "r") as f:
    zepp_devices = json.loads(f.read())


def get_by_source(src):
    for dev in zepp_devices:
        if src in dev["deviceSource"]:
            return dev
    return None


def get_by_id(d_id):
    for dev in zepp_devices:
        if dev['id'] == d_id:
            return dev
    return None


# -------------------------------------------------
#               Fetch producctionIDs
# -------------------------------------------------

with open("failed_prod_ids.json", "r") as f:
    skip_ids = json.load(f)

pprint('[==] Obtaining missing productionIDs...')
pprint("     This will take a while, and will make a lot of requests to Amazfit's server")
pprint("     If it fails, try it through VPN")

for device in zepp_devices:
    for i in range(len(device["deviceSource"])):
        if device["productionId"][i] is not None:
            continue

        source = device["deviceSource"][i]
        if source in skip_ids:
            pprint(f'[--] Skipping {source} / "{device['deviceName']}" since marked as failed')
            continue
        pprint(f'[--] Trying to find productionId for {source} / "{device['deviceName']}"... ', end='')

        for candidate in range(*PRODUCTION_ID_RANGE):
            print(f'{candidate} ', end='', flush=True)
            data = fetch_latest_release(source, candidate, device["application"])
            if "firmwareUrl" in data:
                print('OK')
                print("     ", data['firmwareUrl'])
                device["productionId"][i] = candidate
                break

        if device["productionId"][i] is None:
            print("FAILURE")
            print("     Not found")


# -------------------------------------------------
#                   save changes
# -------------------------------------------------

pprint('[==] Saving changes...')
with open('non_zepp_devices.json', "w") as f:
    json.dump(zepp_devices, f, indent=2)
