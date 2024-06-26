import sys 
sys.path.append('../')
from data.get_raw_data import get_raw_data, get_national_data
from process.process_data import process_data
from features.build_stop_features import get_stops_features
from utils.db import drop_table
import os
import json
import argparse
import pandas as pd
import geopandas as gpd
import shutil


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
    parser.add_argument("--overwrite", action='store_true',required=False)
    parser.add_argument("--get_national", action='store_true', required=False)
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    
    if opts.city:
        msa_ids = str.split(opts.city,",")
    else: 
        msa_ids = config["MSA"]

    if opts.get_national:
        get_national_data(config)

    if opts.overwrite:
        print("Dropping tables")
        drop_table(config['db_string'],'stop_features')
        drop_table(config['db_string'],'hospitals')
        drop_table(config['db_string'],'cities')
        
    for msa_id in msa_ids:
        try:
            output_path = f"{config['base_path']}/cities/{msa_id}/results/stop_features.geojson"
            feeds_path = f"{config['base_path']}/cities/{msa_id}/transit_feeds/"
            if os.path.exists(feeds_path) and opts.overwrite:
                shutil.rmtree(feeds_path)
                # pass
            if not os.path.exists(output_path) or opts.overwrite:
                print(f"Running Data pipeline for: {msa_id}")
                get_raw_data(config, msa_id)
                process_data(config, msa_id)
                get_stops_features(config, msa_id, out=True)
            else:
                print(f"Skipping {msa_id}: stop_features already exists")
        except Exception as e:
            with open('pipeline_errors.txt', 'a') as file:
                file.write(f'{msa_id}: {e} \n')
            
    
    # print(f"Combining the results")
    # concat_results(config, msa_ids)


if __name__ == "__main__":
    main()
