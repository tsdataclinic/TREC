import urllib.request
import gzip
import shutil

path = "/home/data/census/nyc/LODES/"
file_name = "ny_od_main_JT01_2019.csv.gz"

urllib.request.urlretrieve("https://lehd.ces.census.gov/data/lodes/LODES7/ny/od/ny_od_main_JT01_2019.csv.gz", path + "")

with gzip.open(path + file_name, 'r') as f_in, open(path + 'ny_od_main_JT01_2019.csv', 'wb') as f_out:
    shutil.copyfileobj(f_in, f_out)