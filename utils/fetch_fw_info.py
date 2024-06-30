import json
from rq import FETCH_FW_EXTRA_QUERY, FETCH_FW_HEADERS, get_with_retries


def fetch_latest_release(device, production, application):
    app_version = {
        "com.xiaomi.hm.health": "6.9.7_50764",
        "com.huami.midong": "8.5.2-play_151214",
    }[application]
    app_version_iv = "_".join(list(app_version.split("_")[::-1]))

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


with open("zepp_devices.json", "r") as f:
    zepp_devices = json.load(f)

for device in zepp_devices:
    for i in range(len(device["deviceSource"])):
        if device["productionId"][i] is not None:
            continue

        source = device["deviceSource"][i]
        print(f"Trying to find productionId for {source}")

        for candidate in range(255, 262):
            data = fetch_latest_release(source, candidate, device["application"])
            if "firmwareUrl" in data:
                print("Found", source, "=", candidate)
                device["productionId"][i] = candidate
                break

        if device["productionId"][i] is None:
            print("Not found")


with open("zepp_devices.json", "w") as f:
    json.dump(zepp_devices, f, indent=2)
