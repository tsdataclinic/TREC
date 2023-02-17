from get_transit_data import get_transit_feeds
from get_LODES import get_LODES
from get_POI_data import get_poi_data
from get_walk_graph import make_walk_graph
# from get_cenus_data import get_census_geographies
import argparse
import os
import json


def main():
    parser = argparse.ArgumentParser("Get all raw data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    print("Getting points of interest data") 
    get_poi_data(config)
    print("Getting Transit feeds") 
    get_transit_feeds(config, opts.city)
    # print("Getting Census geographies") 
    # get_census_geographies(config, opts.city)
    print("Getting LODES data") 
    get_LODES(config, opts.city)
    print("Getting OSM data") 
    make_walk_graph(config, opts.city)
    
    
if __name__ == "__main__":
    main()
