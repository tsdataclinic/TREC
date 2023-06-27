import urllib.request
import gzip
import shutil
import argparse
import os
import json


def get_LODES(config, city_key):
    """
    Computes areally interpolated sums total number of people working inside supplied polygons
    
    Parameters
    ----------
    area_folder_name: str
        Name of folder to save in e.g. 'nyc', 'hamptom_roads' 
    state: str
        Lowercase two letter state code e.g.
    Returns
    ----------
    Writes and unzips LODES file for speicified state
    """
    path = f"{config['base_path']}/cities/{city_key}/census/LODES/"
    state = config[city_key]['state']
    file_name = state + "_od_main_JT01_2020.csv.gz"
    url = "https://lehd.ces.census.gov/data/lodes/LODES8/" + state.lower() + "/od/" + state.lower() + "_od_main_JT01_2020.csv.gz"

    if not os.path.isdir(path):
        os.makedirs(path)
    
    urllib.request.urlretrieve(url, path + file_name)

    with gzip.open(path + file_name, 'r') as f_in, open(path + file_name[:-3], 'wb') as f_out:
        shutil.copyfileobj(f_in, f_out)

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