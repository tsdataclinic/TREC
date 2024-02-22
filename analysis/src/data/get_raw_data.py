import sys 
sys.path.append('../')
from data.get_transit_data import get_transit_feeds
from data.get_LODES import get_LODES
from data.get_POI_data import get_poi_data
from data.get_osm_data import get_osm_data
from data.get_census_data import get_census
import argparse
import os
import json


def get_raw_data(config, msa_id):


    print("Getting points of interest data") 
    # get_poi_data(config)
    print("Getting Census geographies") 
    # get_census(config, msa_id)
    print("Getting Transit feeds") 
    # get_transit_feeds(config, msa_id)
    print("Getting LODES data") 
    # get_LODES(config, msa_id)
    print("Getting OSM data") 
    get_osm_data(config, msa_id)

def main():
    parser = argparse.ArgumentParser("Get all raw data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", default=False, required=False)
    
    opts = parser.parse_args()
    with open(opts.config) as f:
        config = json.load(f)

    if opts.city:
        msa_ids = str.split(opts.city,",")
    else: 
        msa_ids = config["MSA"]
    
    for msa_id in msa_ids:
        get_raw_data(config, msa_id)
    
    
if __name__ == "__main__":
    main()
