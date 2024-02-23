import urllib.request
import gzip
import shutil
import argparse
import os
import json
import glob
import pandas as pd

US_STATE_CODES = [
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

def get_LODES_state(config, state_code):
    """
    Downloads LODES (main and aux) data for specified state
    
    Returns
    ----------
    Writes and unzips LODES file for speicified state
    """
    path = f"{config['base_path']}/national/LODES/{state_code}/"

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
            
            if i == 0:
                print(f"Downloaded and extracted LODES data for {state_code}")
        except:
            print(f"No LODES data available for {state_code}")
            continue

def get_LODES(config, state_codes):
    for state_code in state_codes:
        get_LODES_state(config, state_code)

def concatenate_LODES(config, state_codes):
    dfs = []
    for state_code in state_codes:
        path = f"{config['base_path']}/national/LODES/{state_code}/*.csv"
        dataframes = [pd.read_csv(file) for file in glob.glob(path)]
        combined_dataframe = pd.concat(dataframes, ignore_index=True)
        dfs.append(combined_dataframe)

    lodes = pd.concat(dfs)
    lodes['h_geocode'] = lodes['h_geocode'].astype(str).str.zfill(15)
    lodes['w_geocode'] = lodes['w_geocode'].astype(str).str.zfill(15)
    
    return lodes

def main():
    parser = argparse.ArgumentParser("Get LODES")
    parser.add_argument("--config", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_LODES(config, US_STATE_CODES)
    print("LODES data written and unzipped") 
    
if __name__ == "__main__":
    main()