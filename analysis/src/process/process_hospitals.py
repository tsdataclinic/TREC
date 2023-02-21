import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
import argparse
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys
sys.path.append('../')
from src.utils.geo import create_extent
import os
import json

NYC_COUNTY_CODES = [5,47,61,81,85]

def subset_hospital_points(points, extent, county_list=[]):
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

    hospitals_gdf_extent = hospitals_gdf.sjoin(extent, how='inner')
    if len(county_list) > 0:
        hospitals_gdf_extent = hospitals_gdf_extent[hospitals_gdf_extent.COUNTY_NUMERIC.isin(county_list)]

    return hospitals_gdf_extent

def process_hospitals(config, city_key, out=False):
    poi_path = f"{config['base_path']}/national/"
    poi_file = os.listdir(poi_path)[0]
    poi_data = pd.read_csv(poi_path+poi_file,sep='|')

    geo_path = f"{config['base_path']}/cities/{city_key}/census/geo/tracts.geojson"
    extent = create_extent(geo_path)
    if city_key == 'nyc':
        county_list = NYC_COUNTY_CODES
    else:
        county_list = []

    hospitals = subset_hospital_points(poi_data, extent,county_list)
    if out == True:
        out_path = f"{config['base_path']}/cities/{city_key}/results/"
        if not os.path.isdir(out_path):
            os.makedirs(out_path)

        hospitals.to_file(out_path+"hospitals.geojson", driver='GeoJSON')
        print("Hospitals data written to: " + out_path) 
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
    out_path = f"{config['base_path']}/cities/{city_key}/results/"
    if not os.path.isdir(out_path):
        os.makedirs(out_path)

    hospitals.to_file(out_path+"hospitals.geojson", driver='GeoJSON')
    print("Hospitals data written to: " + out_path) 
    
if __name__ == "__main__":
    main()

