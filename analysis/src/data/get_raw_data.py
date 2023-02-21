import sys 
sys.path.append('../')
from src.data.get_transit_data import get_transit_feeds
from src.data.get_LODES import get_LODES
from src.data.get_POI_data import get_poi_data
from src.data.get_osm_data import get_osm_data
import subprocess
import argparse
import os
import json
CWD = os.getcwd()

def get_raw_data(config, city_key):
    print("Getting points of interest data") 
    get_poi_data(config)
    print("Getting Transit feeds") 
    get_transit_feeds(config, city_key)
    print("Getting Census geographies") 
    subprocess.run(["Rscript", f"{CWD}/data/get_census_data.R","--config",config,"--city",city_key])
    print("Getting LODES data") 
    get_LODES(config, city_key)
    print("Getting OSM data") 
    get_osm_data(config, city_key)

def main():
    parser = argparse.ArgumentParser("Get all raw data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    print(opts.config)
    
    with open(opts.config) as f:
        config = json.load(f)

    get_raw_data(config, opts.city)
    
    
if __name__ == "__main__":
    main()
