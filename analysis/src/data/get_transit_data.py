from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO
import argparse
import json


def get_transit_feeds(config, city_key):
    """
    Read feed URLs from config file, download, and unzip these to their respective folders.
    
    Parameters
    ----------
    config: JSON
        JSON configuration file

    """
    base_path = f"{config['base_path']}/cities/{city_key}/transit_feeds/"
    feeds = config[city_key]['transit_feeds']
    feed_names = list(feeds.keys())
    transit_land_feed_keys = list(feeds.values())
    
    for i in range(0,len(transit_land_feed_keys)):
        feed_url = f"https://transit.land/api/v2/rest/feeds/{transit_land_feed_keys[i]}/download_latest_feed_version?api_key={config['transit_land_api_key']}"
        print(feed_url)
        with urlopen(feed_url) as zipresp:
            print("Downloading from: " + feed_url + " as " + feed_names[i])
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
    