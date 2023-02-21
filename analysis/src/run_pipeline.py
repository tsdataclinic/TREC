import sys 
sys.path.append('../')
from src.data.get_raw_data import get_raw_data
from src.process.process_data import process_data
from src.features.build_stop_features import get_stops_features
import os
import json
import argparse


def main():
    parser = argparse.ArgumentParser("Run data pipeline")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    
    cities = opts.city
    if cities == 'all':
        city_keys = list(set(config.keys()) - set(['base_path','national']))

    for city_key in city_keys:
        print(f"Running Data pipeline for: {city_key}")
        get_raw_data(config, city_key)
        process_data(config, city_key)
        get_stops_features(config, city_key, out=True)


if __name__ == "__main__":
    main()
