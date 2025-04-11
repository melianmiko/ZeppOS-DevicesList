import requests
import time

def get_with_retries(*args, **kwargs):
    retries = 0
    while retries < 3:
        # noinspection PyBroadException
        try:
            return requests.get(*args, **kwargs, timeout=10)
        except Exception:
            time.sleep(1)
            print(f"Retry {retries}...")
            continue
    raise Exception("Request failed after 3 retires")


def get_app_versions(application):
    app_version = {
        "com.xiaomi.hm.health": "6.9.7_50764",
        "com.huami.midong": "9.3.0-play_151525",
    }[application]
    app_version_iv = "_".join(list(app_version.split("_")[::-1]))

    return application, app_version_iv

ZEPP_VERSION = "9.6.1-play_151585"

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
