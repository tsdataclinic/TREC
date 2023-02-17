from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO
import argparse
import json

BASE_PATH = 'data'

def get_transit_feeds(config, city_key):
    """
    Read feed URLs from config file, download, and unzip these to their respective folders.
    
    Parameters
    ----------
    config: JSON
        JSON configuration file

    """
    base_path = f"{BASE_PATH}/cities/{city_key}/transit_feeds/"
    feeds = config[city_key]['transit_feeds']
    feed_names = list(feeds.keys())
    feed_urls = list(feeds.values())
    
    for i in range(0,len(feed_urls)):
        with urlopen(feed_urls[i]) as zipresp:
            print("Downloading from: " + feed_urls[i] + " as " + feed_names[i])
            with ZipFile(BytesIO(zipresp.read())) as zfile:
                zfile.extractall(base_path + feed_names[i])


def main():
    parser = argparse.ArgumentParser("Get Transit Feed")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)

    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_transit_feeds(config, opts.city)
    
if __name__ == "__main__":
    main()
    