from optparse import OptionParser
import pandas as pd
import geopandas as gpd
import json
from pathlib import Path
import os
import censusdis.data as ced
from pandas import json_normalize


def get_census(config, city_key):
    """
    Retreives census shapefiles for city based on msa codes supplied in config
    """

    base_path = config['base_path']
    city_config = json_normalize(config[city_key])
    msa_codes = city_config[city_config['city_code'] == city_key]['msa_code'].iloc[0]

    # File Paths
    path = f"{base_path}/cities/{city_key}/census/geo/"
    msa_path = f"{base_path}/national/qcew-county-msa-csa-crosswalk-csv.csv"
    tract_path = "tracts.geojson"
    tract_2010_path = "tracts_2010.geojson"
    block_group_path = "block_groups.geojson"    

    if not os.path.isdir(path):
        os.makedirs(path)
    
    all_msa = pd.read_csv(msa_path, encoding="ISO-8859-1")
    selected_msa = all_msa[all_msa['MSA Code'].isin(msa_codes)]
    selected_msa_counties_five_digits = selected_msa['County Code'].astype(str).str.zfill(5)
    selected_msa_states = list(set(state[:2] for state in selected_msa_counties_five_digits))    

    # 2020 block groups
    gdf_block_group = ced.download("acs/acs5", 2020, ["NAME"], state=selected_msa_states, county = "*", block_group = "*", with_geometry=True)

    gdf_block_group["GEOID"] = gdf_block_group["STATE"] + gdf_block_group["COUNTY"] + gdf_block_group["TRACT"] + gdf_block_group["BLOCK_GROUP"]
    gdf_block_group["county"] = gdf_block_group["STATE"] + gdf_block_group["COUNTY"]
    gdf_block_group = gdf_block_group[["GEOID", "NAME", "county", "geometry"]]
    gdf_block_group = gdf_block_group.query("county.isin(@selected_msa_counties_five_digits)")

    gdf_block_group.to_file(f'{path}{block_group_path}')

    # 2020 tracts
    gdf_tract = ced.download("acs/acs5", 2020, ["NAME"], state=selected_msa_states, county = "*", tract = "*", with_geometry=True)

    gdf_tract["GEOID"] = gdf_tract["STATE"] + gdf_tract["COUNTY"] + gdf_tract["TRACT"] 
    gdf_tract["county"] = gdf_tract["STATE"] + gdf_tract["COUNTY"]
    gdf_tract = gdf_tract[["GEOID", "NAME", "county", "geometry"]]
    gdf_tract = gdf_tract.query("county.isin(@selected_msa_counties_five_digits)")

    gdf_tract.to_file(f'{path}{tract_path}')

    # 2010 tracts
    gdf_tract_2010 = ced.download("acs/acs5", 2010, ["NAME"], state=selected_msa_states, county = "*", tract = "*", with_geometry=True)

    gdf_tract_2010["GEOID"] = gdf_tract_2010["STATE"] + gdf_tract_2010["COUNTY"] + gdf_tract_2010["TRACT"] 
    gdf_tract_2010["county"] = gdf_tract_2010["STATE"] + gdf_tract_2010["COUNTY"]
    gdf_tract_2010 = gdf_tract_2010[["GEOID", "NAME", "county", "geometry"]]
    gdf_tract_2010 = gdf_tract_2010.query("county.isin(@selected_msa_counties_five_digits)")

    gdf_tract_2010.to_file(f'{path}{tract_2010_path}')

def main():
    parser = argparse.ArgumentParser("Get Census")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_census(config, opts.city)
    print("Census geographies written") 
    
if __name__ == "__main__":
    main()