from urllib.request import urlopen
import argparse
import os
from zipfile import ZipFile
from io import BytesIO
import json

def get_poi_data(config):
    path = f"{config['base_path']}/national/"
    url = config['national']['poi_url']

    if not os.path.isdir(path):
            os.makedirs(path)

    with urlopen(url) as zipresp:
        with ZipFile(BytesIO(zipresp.read())) as zfile:
            zfile.extractall(path)

def main():
    parser = argparse.ArgumentParser("Get LODES")
    parser.add_argument("--config", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_poi_data(config)
    print("POI data written") 
    
if __name__ == "__main__":
    main()