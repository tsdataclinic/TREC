import sys 
sys.path.append('../')
from data.get_transit_data import get_transit_feeds
from data.get_LODES import get_LODES
from data.get_POI_data import get_poi_data
from data.get_osm_data import get_osm_data
import subprocess
import argparse
import os
import json


def get_raw_data(config, city_key):

    CWD = os.getcwd()
    with open(config) as f:
        config_file = json.load(f)

    print("Getting points of interest data") 
    get_poi_data(config_file)
    print("Getting Transit feeds") 
    get_transit_feeds(config_file, city_key)
    print("Getting Census geographies") 
    subprocess.run(["Rscript", f"{CWD}/src/data/get_census_data.R","--config",config,"--city",city_key])
    print("Getting LODES data") 
    get_LODES(config_file, city_key)
    print("Getting OSM data") 
    get_osm_data(config_file, city_key)

def main():
    parser = argparse.ArgumentParser("Get all raw data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()

    get_raw_data(opts.config, opts.city)
    
    
if __name__ == "__main__":
    main()
