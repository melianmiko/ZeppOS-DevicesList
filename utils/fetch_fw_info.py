import json
import sys
from urllib.parse import urlencode
from rq import FETCH_FW_HEADERS, FETCH_FW_QUERY_ARGS, get_with_retries

filename = sys.argv[1]
allowed = None
if len(sys.argv) > 2:
    allowed = [int(x) for x in sys.argv[2].split(",")]
    print(f"Will process only {allowed}")

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

        for candidate in range(240, 270):
            print("try", candidate)
            data = fetch_latest_release(source, candidate, device["application"])
            if "firmwareUrl" in data:
                print("Found", source, "=", candidate, data['firmwareUrl'])
                device["productionId"][i] = candidate
                break

        if device["productionId"][i] is None:
            print("Not found")


with open(filename, "w") as f:
    json.dump(zepp_devices, f, indent=2)
