import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys
sys.path.append('../')
from src.data.osm_data import create_extent

def subset_hospital_points(poi_data, extent):
    """
    Subsets GNIS data for Hospital locations within given extent
    
    Parameters
    ----------
    poi_data: str
        Path to GNIS data
    extent: GeoDataFrame
        Geographical extent to subset to

    Returns
    ----------
    GeoDataFrame
    """
    points = pd.read_csv(poi_data,sep='|')
    hospitals = points[points.FEATURE_CLASS.str.contains('Hospital')]
    hospitals_gdf = gpd.GeoDataFrame(
        hospitals, geometry=gpd.points_from_xy(hospitals.PRIM_LONG_DEC, hospitals.PRIM_LAT_DEC))
    hospitals_gdf = hospitals_gdf.set_crs(epsg=4326)
    
    ## Excluding histaorical locations
    hospitals = hospitals[~hospitals.FEATURE_NAME.str.contains('historical')]
    
    hospitals_gdf_extent = hospitals_gdf.sjoin(extent, how='inner')
    
    return hospitals_gdf_extent


def main():
    parser = argparse.ArgumentParser("Hospital Locations")
    parser.add_argument("--poi", required=True)
    parser.add_argument("--extent", required=True)
    parser.add_argument("--out",  required=True)
    
    opts = parser.parse_args()
    extent = create_extent(opts.extent)
    hospitals = subset_hospital_points(opts.poi, extent)
    
    hospitals.to_file(opts.out, driver='GeoJSON')
    
if __name__ == "__main__":
    main()
    