import urllib.request
import gzip
import shutil
import argparse
import os
import json
import glob
import pandas as pd

us_state_codes = [
    "AL", "AK", "AZ", "AR", "CA",
    "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO",
    "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH",
    "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY",
    "PR", "DC"
]

def get_LODES(config, state_code):
    """
    Downloads LODES data for specified city
    
    Returns
    ----------
    Writes and unzips LODES file for speicified state
    """
    path = f"{config['base_path']}/national//LODES/{state_code}/"

    file_names =  [state_code + "_od_main_JT00_2021.csv.gz", state_code + "_od_aux_JT00_2021.csv.gz"]

    urls = ["https://lehd.ces.census.gov/data/lodes/LODES8/" + state_code.lower() + "/od/" + state_code.lower() + "_od_main_JT00_2021.csv.gz",
            "https://lehd.ces.census.gov/data/lodes/LODES8/" + state_code.lower() + "/od/" + state_code.lower() + "_od_aux_JT00_2021.csv.gz"]

    if not os.path.isdir(path):
        os.makedirs(path)

    for i in [0,1]:
        try:
            urllib.request.urlretrieve(urls[i], path + file_names[i])

            with gzip.open(path + file_names[i], 'r') as f_in, open(path + file_names[i][:-3], 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        except:
            continue

def main():
    parser = argparse.ArgumentParser("Get LODES")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_LODES(config, opts.city)
    print("LODES data written and unzipped") 
    
if __name__ == "__main__":
    main()