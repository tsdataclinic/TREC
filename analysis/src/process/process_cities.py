import pandas as pd
import geopandas as gpd
import sys
sys.path.append('../')
from utils.geo import create_extent
from utils.db import write_table_to_db
from utils.crosswalks import get_msa_file
import os
import json

def get_msa_display_name(x):
    return x.split(', ')[0].split('-')[0] + ', ' + x.split(', ')[1].split('-')[0]


def create_cities_metadata(config, msa_id):
    msa_data = get_msa_file(config)
    msa_data = msa_data[msa_data['MSA Code']==msa_id][['MSA Code','MSA Title']]
    msa_data = msa_data.drop_duplicates().rename(columns={'MSA Code':'msa_id','MSA Title':'msa_name'})
    msa_data['msa_name'] = [get_msa_display_name(x) for x in msa_data['msa_name']]
    msa_data = msa_data.reset_index(drop=True)
    stops_path = f"{config['base_path']}/cities/{msa_id}/stops.geojson"
    stops = gpd.read_file(stops_path)
    centroid = stops.to_crs(epsg=4326).dissolve().centroid
    centroid = gpd.GeoDataFrame(centroid).rename(columns={0:'geometry'}).set_geometry(col='geometry')
    msa_gdf = gpd.GeoDataFrame(msa_data, geometry=centroid.geometry)
    
    if config["db_string"] != "":
        write_table_to_db(config["db_string"],msa_gdf,'cities')



