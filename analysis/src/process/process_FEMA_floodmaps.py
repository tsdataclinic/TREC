import geopandas as geopd
import json
import subprocess 
import os 
import pandas as pd
import requests 
import os
import zipfile
import argparse

def extract_zip_file(file_to_extract, destination):
    with zipfile.ZipFile(file_to_extract, 'r') as zip_ref:
        zip_ref.extractall(destination)

def find_largest_file(directory):
    largest_file = ''
    largest_size = 0

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_size = os.path.getsize(file_path)
            if file_size > largest_size:
                largest_file = file_path
                largest_size = file_size

    return largest_file

def main():
    parser = argparse.ArgumentParser("Process FEMA floodmaps")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)

    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    city = opts.city

    base_path = config["base_path"]
    FEMA_file_prefix = config[city]["FEMA_file_name"]
    city_path = f"{base_path}/cities/{city}"
    zip_path = f"{base_path}/national/floodmaps/{FEMA_file_prefix}.zip"
    extracted_folder_path = f"{city_path}/floodmaps/{FEMA_file_prefix}"
    gdb_folder_path = f"{extracted_folder_path}/{FEMA_file_prefix}.gdb"
    tract_path = f"{city_path}/census/geo/tracts.geojson"

    if not os.path.exists(extracted_folder_path):
        extract_zip_file(zip_path, extracted_folder_path)

    gdb_table_to_read = find_largest_file(gdb_folder_path)

    FEMA_flood = geopd.read_file(gdb_table_to_read)
    FEMA_flood = FEMA_flood.to_crs(4326)
    FEMA_flood["geometry"] = FEMA_flood.simplify(0.0001)

    tracts_combined = geopd.GeoDataFrame({'geometry' : geopd.read_file(tract_path).unary_union}, index=[0]).set_crs(4326)

    out = FEMA_flood.overlay(tracts_combined)
    out.to_file(f"{city_path}/floodmaps/processed_fema.geojson")
    print(f"Processed FEMA floodmap data written to: {city_path}/floodmaps/processed_fema.geojson") 

    
if __name__ == "__main__":
    main()
