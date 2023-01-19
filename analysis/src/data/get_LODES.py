import urllib.request
import gzip
import shutil
import argparse
import os


def get_LODES(area_folder_name, state):
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
    
    file_name = state + "_od_main_JT01_2019.csv.gz"
    path = "/home/data/census/" + area_folder_name + "/LODES/"
    url = "https://lehd.ces.census.gov/data/lodes/LODES7/" + state + "/od/" + state + "_od_main_JT01_2019.csv.gz"

    if not os.path.isdir(path):
        os.mkdir(path)
    
    urllib.request.urlretrieve(url, path + file_name)

    with gzip.open(path + file_name, 'r') as f_in, open(path + file_name[:-3], 'wb') as f_out:
        shutil.copyfileobj(f_in, f_out)

def main():
    parser = argparse.ArgumentParser("Get LODES")
    parser.add_argument("--area_folder_name", required=True)
    parser.add_argument("--state", required=True)
    
    opts = parser.parse_args()
    
    area_folder_name = opts.area_folder_name
    state = opts.state

    get_LODES(area_folder_name, state)
    print("LODES data written and unzipped") 
    
if __name__ == "__main__":
    main()
