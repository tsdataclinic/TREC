import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
import argparse
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys
sys.path.append('../')
from utils.geo import create_extent
from utils.db import write_table_to_db
import os
import json

NYC_COUNTY_CODES = [5,47,61,81,85]
COLUMNS_TO_KEEP = ['FEATURE_NAME', 'FEATURE_CLASS',
                   'geometry']


def subset_hospital_points(points, extent):
    """
    Subsets GNIS data for Hospital locations within given extent
    
    Parameters
    ----------
    poi: DataFrame
        GNIS data
    extent: GeoDataFrame
        Geographical extent to subset to

    Returns
    ----------
    GeoDataFrame
    """

    hospitals = points[points.FEATURE_CLASS.str.contains('Hospital')]
    hospitals_gdf = gpd.GeoDataFrame(
        hospitals, geometry=gpd.points_from_xy(hospitals.PRIM_LONG_DEC, hospitals.PRIM_LAT_DEC))
    hospitals_gdf = hospitals_gdf.set_crs(epsg=4326)
    
    ## Excluding histaorical locations
    hospitals_gdf = hospitals_gdf[~hospitals_gdf.FEATURE_NAME.str.contains('historical')]

    hospitals_gdf_extent = hospitals_gdf.sjoin(extent.to_crs(hospitals_gdf.crs), how='inner')

    return hospitals_gdf_extent

def process_hospitals(config, msa_id, out=False):
    poi_path = f"{config['base_path']}/national/"
    poi_file = os.listdir(poi_path)[0]
    poi_data = pd.read_csv(poi_path+poi_file,sep='|')

    geo_path = f"{config['base_path']}/cities/{msa_id}/census/geo/tracts.geojson"
    extent = create_extent(geo_path)

    hospitals = subset_hospital_points(poi_data, extent)
    hospitals = hospitals[COLUMNS_TO_KEEP]
    hospitals['city'] = msa_id
    if out == True:
        out_path = f"{config['base_path']}/cities/{msa_id}/results/"
        if not os.path.isdir(out_path):
            os.makedirs(out_path)

        hospitals.to_file(out_path+"hospitals.geojson", driver='GeoJSON')
        print("Hospitals data written to: " + out_path) 

        if config["db_string"] != "":
            write_table_to_db(config["db_string"],hospitals,'hospitals_new')
    else:
        return hospitals

    
def main():
    parser = argparse.ArgumentParser("Process hospitals")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)

    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    hospitals = process_hospitals(config, opts.city)
    out_path = f"{config['base_path']}/cities/{opts.city}/results/"
    if not os.path.isdir(out_path):
        os.makedirs(out_path)

    hospitals.to_file(out_path+"hospitals.geojson", driver='GeoJSON')
    print("Hospitals data written to: " + out_path) 
    
if __name__ == "__main__":
    main()

