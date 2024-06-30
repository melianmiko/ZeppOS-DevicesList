import requests

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


FETCH_FW_HEADERS = {
    "apptoken": "0",
    "appplatform": "android_phone",
    "hm-privacy-diagnostics": "false",
    "hm-privacy-ceip": "false",
    "cv": "151214_8.5.2-play",
    "lang": "en_US",
}

FETCH_FW_EXTRA_QUERY = (f"&userId=0"
                        f"&productId=-1"
                        f"&vendorSource=1"
                        f"&resourceVersion=0"
                        f"&firmwareFlag=-1"
                        f"&vendorId=-1"
                        f"&baseResourceVersion=0"
                        f"&resourceFlag=-1"
                        f"&fontVersion=0"
                        f"&diagnosticCode=1"
                        f"&fontFlag=0"
                        f"&appid=0&"
                        f"channel=play"
                        f"&device=android_33"
                        f"&deviceType=ALL"
                        f"&device_type=android_phone"
                        f"&gpsVersion="
                        f"&hardwareVersion=0"
                        f"&lang=en_US"
                        f"&country=US"
                        f"&support8Bytes=true"
                        f"&v=2.0")
