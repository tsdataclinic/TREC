import sys 
sys.path.append('../')
from data.get_raw_data import get_raw_data
from process.process_data import process_data
from features.build_stop_features import get_stops_features
import os
import json
import argparse
import pandas as pd
import geopandas as gpd

def concat_results(config, city_keys):
    hospitals = []
    stop_features = []
    for city_key in city_keys:
        h = gpd.read_file(f"{config['base_path']}/cities/{city_key}/results/hospitals.geojson")
        hospitals.append(h)
        s = gpd.read_file(f"{config['base_path']}/cities/{city_key}/results/stop_features.geojson")
        stop_features.append(s)

    hospitals = pd.concat(hospitals)
    hospitals.to_file(f"{config['base_path']}/hospitals.geojson",driver='GeoJSON')
    stop_features = pd.concat(stop_features)
    with open(f"{config['base_path']}/stop_features.geojson", 'w') as file:
        file.write(stop_features.to_json())

    stop_features.drop("geometry", axis = 1).to_csv(f"{config['base_path']}/stop_features.csv")


def main():
    parser = argparse.ArgumentParser("Run data pipeline")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    
    cities = opts.city
    if cities == 'all':
        city_keys = list(set(config.keys()) - set(['base_path','transit_land_api_key','national']))
    else:
        city_keys = [opts.city]
        
    for city_key in city_keys:
        print(f"Running Data pipeline for: {city_key}")
        get_raw_data(opts.config, city_key)
        process_data(config, city_key)
        get_stops_features(config, city_key, out=True)
    
    print(f"Combining the results")
    city_keys = list(set(config.keys()) - set(['base_path','transit_land_api_key','national']))
    concat_results(config, city_keys)


if __name__ == "__main__":
    main()
