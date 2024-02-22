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

def concat_results(config, msa_ids):
    hospitals = []
    stop_features = []
    for msa_id in msa_ids:
        h = gpd.read_file(f"{config['base_path']}/cities/{msa_id}/results/hospitals.geojson")
        hospitals.append(h)
        s = gpd.read_file(f"{config['base_path']}/cities/{msa_id}/results/stop_features.geojson")
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
    parser.add_argument("--city", default=False, required=False)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    
    if opts.city:
        msa_ids = str.split(opts.city,",")
    else: 
        msa_ids = config["MSA"]
        
    for msa_id in msa_ids:
        print(f"Running Data pipeline for: {msa_id}")
        # get_raw_data(config, msa_id)
        process_data(config, msa_id)
        # get_stops_features(config, msa_id, out=True)
    
    print(f"Combining the results")
    # concat_results(config, msa_ids)


if __name__ == "__main__":
    main()
