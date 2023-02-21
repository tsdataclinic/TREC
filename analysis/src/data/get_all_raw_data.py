from src.data.get_transit_data import get_transit_feeds
from src.data.get_LODES import get_LODES
from src.data.get_POI_data import get_poi_data
from src.data.get_osm_data import get_osm_data
import subprocess
import argparse
import os
import json


def main():
    parser = argparse.ArgumentParser("Get all raw data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    path = os.getcwd()
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    print("Getting points of interest data") 
    get_poi_data(config)
    print("Getting Transit feeds") 
    get_transit_feeds(config, opts.city)
    print("Getting Census geographies") 
    subprocess.run(["Rscript", f"{path}/src/data/get_census_data.R",opts.config,opts.city])
    print("Getting LODES data") 
    get_LODES(config, opts.city)
    print("Getting OSM data") 
    get_osm_data(config, opts.city)
    
    
if __name__ == "__main__":
    main()
