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

ZEPP_VERSION = "9.13.1-play_151700"
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
#                   Restore session
# -------------------------------------------------

token_info = None
need_login = True
if TOKEN_PATH.is_file():
    with open(TOKEN_PATH, "r") as f:
        token_info = json.loads(f.read())

    pprint('[==] Checking account token...')
    try:
        fetch_top(token_info, "com.huami.midong", 8519939, 'watch')
        need_login = False
        pprint('     Session still active, login not required')
    except Exception:
        pprint("[!!] Auth expired, need relogin")

# -------------------------------------------------
#                   Auto-login
# -------------------------------------------------

if need_login:
    pprint('[==] Auto-login...')
    login = input('Login: ')
    password = input('Password: ')
    token_response = requests.post(f"https://api-user.huami.com/registrations/{login}/tokens",
                                   headers={
                                       "app_name": "com.huami.zeppos.cli",
                                       "Content-Type": "application/x-www-form-urlencoded"
                                   },
                                   data={
                                       "client_id": "HuaMi",
                                       "country_code": "US",
                                       "json_response": "true",
                                       "name": login,
                                       "password": password,
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

    token_info = login_response["token_info"]
    with open(TOKEN_PATH, 'w') as f:
        f.write(json.dumps(token_info))

# -------------------------------------------------
#                   Prepare
# -------------------------------------------------

pprint('[==] Parsing existing data...')
with open("zepp_devices.json", "r") as f:
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
#                   zeus-cli db paser
# -------------------------------------------------

pprint(f"[==] Processing {ZEUS_DEVICES_URL}...")
payload = requests.get(ZEUS_DEVICES_URL).json()
dev_by_prod_name = {}
new_devs = []

for row in payload:
    dev = get_by_source(row['deviceSource'])
    if dev:
        # Update data
        os_ver = f'{row["value"]["os"]["apiLevel"]}.0'
        cur_ver = dev["osVersion"]
        if ver2int(os_ver) != ver2int(cur_ver):
            pprint(f'    "{dev["deviceName"]}": ZeppOS changed {cur_ver} -> {os_ver}')
            dev["osVersion"] = os_ver
        if "alternativeDeviceNames" not in dev:
            dev["alternativeDeviceNames"] = []
        if row['productName'] != dev['deviceName'] and row['productName'] not in dev['alternativeDeviceNames']:
            pprint(f'     "{dev["deviceName"]}": New alt name "{row['productName']}"')
            dev['alternativeDeviceNames'].append(row['productName'])
        dev_by_prod_name[row["productName"]] = dev
        for alt in dev['alternativeDeviceNames']:
            dev_by_prod_name[alt] = dev
    else:
        new_devs.append(row)

for row in new_devs:
    target = None

    # Ask user for device target
    pprint(f'[--] Adding new device {row["deviceSource"]} / "{row['productName']}"')

    if ask('View source', ['y','n']) == 'y':
        pprint(row['value'])

    if row["productName"] in dev_by_prod_name:
        td = dev_by_prod_name[row["productName"]]
        if ask(f'Is this device revision for {td["id"]}', ['y', 'n']) == 'y':
            target = td
    if not target:
        tid = ask('Enter ID for this device', None)
        target = get_by_id(tid)

    # Add to target
    if target is not None:
        pprint(f'     {row['deviceSource']} is now part of {target["id"]}')
        target['deviceSource'].append(row['deviceSource'])
        target['productionId'].append(None)
        if row['productName'] not in target['alternativeDeviceNames']:
            pprint(f'     "{target["deviceName"]}": New alt name "{row['productName']}"')
            target['alternativeDeviceNames'].append(row['productName'])
    else:
        assert row['value']['shape'] in ['round', 'square', 'band']
        sw, sh = [int(x) for x in row['value']['screen']['size'].split('*')]
        pw, ph = [int(x) for x in row['value']['screen']['previewSize'].split('*')]
        icon_size = ask('Target icon size (in most cases is 248)', None)
        btn_count = ask('Buttons count (can be find at https://docs.zepp.com/docs/reference/related-resources/device-list/)', None)
        target = {
            "id": tid,
            "deviceName": row['productName'],
            "alternativeDeviceNames": [],
            "deviceSource": [row['deviceSource']],
            "chipset": row['value']['chip']['manufacturer'].lower(),
            "screenShape": row['value']['shape'],
            "screenWidth": sw,
            "screenHeight": sh,
            "screenRadius": int(sw / 2) if row['value']['shape'] == 'round' else row['value']['screen']['rAngle'],
            "iconSize": int(icon_size),
            "physicalKeysCount": btn_count,
            "watchfacePreviewWidth": pw,
            "watchfacePreviewHeight": ph,
            "osVersion": row['value']['os']['apiLevel'] + '.0',
            "productionId": [None],
            "application": "com.huami.midong",
            "deviceImage": None,
        }
        dev_by_prod_name[row['productName']] = target
        zepp_devices.append(target)


# -------------------------------------------------
#                   Find device images
# -------------------------------------------------

pprint('[==] Obtaining missing device images...')
for device in zepp_devices:
    if "deviceImage" not in device:
        device['deviceImage'] = None
    if device['deviceImage'] is not None:
        continue

    pprint(f'     "{device["deviceName"]}"... ', end='')
    try:
        source = device["deviceSource"][-1]
        app = device["application"]
        row = fetch_top(token_info, app, source, "watch")[0]
        image = row["metas"]["device_image"]
        pprint(image)
        device["deviceImage"] = image
    except Exception as e:
        pprint("failed")


# -------------------------------------------------
#                   save changes
# -------------------------------------------------

pprint('[==] Saving previous changes...')
with open('zepp_devices.json', "w") as f:
    json.dump(zepp_devices, f, indent=2)


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
with open('zepp_devices.json', "w") as f:
    json.dump(zepp_devices, f, indent=2)
