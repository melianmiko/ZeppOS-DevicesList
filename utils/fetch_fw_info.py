import json
import sys
from rq import FETCH_FW_EXTRA_QUERY, FETCH_FW_HEADERS, get_with_retries, get_app_versions

filename = sys.argv[1]
allowed = None
if len(sys.argv) > 2:
    allowed = [int(x) for x in sys.argv[2].split(",")]
    print(f"Will process only {allowed}")


def fetch_latest_release(device, production, application):
    app_version, app_version_iv = get_app_versions(application)
    return get_with_retries(f"https://api.amazfit.com/devices/ALL/hasNewVersion"
                            f"?productionSource={production}"
                            f"&deviceSource={device}"
                            f"&appVersion={app_version}"
                            f"&cv={app_version_iv}"
                            f"&firmwareVersion=0"
                            f"{FETCH_FW_EXTRA_QUERY}",
                            headers=FETCH_FW_HEADERS | {
                                "appname": application
                            }).json()


with open(filename, "r") as f:
    zepp_devices = json.load(f)

for device in zepp_devices:
    for i in range(len(device["deviceSource"])):
        if device["productionId"][i] is not None:
            continue
        if allowed is not None and device["deviceSource"][i] not in allowed:
            continue

        source = device["deviceSource"][i]
        print(f"Trying to find productionId for {source}")

        for candidate in range(200, 300):
            data = fetch_latest_release(source, candidate, device["application"])
            if "firmwareUrl" in data:
                print("Found", source, "=", candidate)
                device["productionId"][i] = candidate
                break

        if device["productionId"][i] is None:
            print("Not found")


with open(filename, "w") as f:
    json.dump(zepp_devices, f, indent=2)
