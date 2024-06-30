import json
from rq import get_with_retries, get_app_versions

with open("test_auth.json", "r") as f:
    auth_data = json.load(f)


def fetch_top(app: str, device_source: str, entry_type: str, page=1):
    _, app_version_iv = get_app_versions(app)
    response = get_with_retries(f"https://api.amazfit.com/market/devices/"
                                f"{device_source}/{entry_type}/apps"
                                f"?page={page}"
                                f"&per_page=15"
                                f"&userid={auth_data['user_id']}"
                                f"&user_country=RU"
                                f"&api_level=305",
                                headers={
                                    "apptoken": auth_data['app_token'],
                                    "Country": "RU",
                                    "appplatform": "android_phone",
                                    "appname": app,
                                    "hm-privacy-diagnostics": "false",
                                    "cv": app_version_iv,
                                })
    data = response.json()
    if response.status_code != 200:
        raise Exception(f"Can't fetch app list: {data}")

    return data["data"]


with open("zepp_devices.json", "r") as f:
    zepp_devices = json.load(f)

for device in zepp_devices:
    if "deviceImage" in device:
        continue

    print("Finding image for", device["deviceName"], "...")
    try:
        source = device["deviceSource"][-1]
        app = device["application"]
        row = fetch_top(app, source, "watch")[0]
        image = row["metas"]["device_image"]
        print("Found: ", image)
        device["deviceImage"] = image
    except Exception:
        print("Failed")


with open("zepp_devices.json", "w") as f:
    json.dump(zepp_devices, f, indent=2)
