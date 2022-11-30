import pandas as pd
import geopandas as geopd
import argparse

EVENT_TYPES = ["CFLD"]
NRI_MEASURES = ["AFREQ", "EALB"]

def tag_points_to_polygon(points, point_id, polygons, polygon_id):
    """
    Creates a crosswalk between points and polygons
    
    Parameters
    ----------
    points: GeoDataFrame
        Geodataframe containing point geometry
    point_id: str
        Name of point data id column
    polygon: GeoDataFrame
        Geodataframe with polygon geometry
    polygon_id: str
        Name of polygon data id column
    Returns
    ----------
    DataFrame
        Mapping of point IDs to polygon IDs in which the points reside
    """

    points = points.to_crs("EPSG:4326") # WGS 84
    polygons = polygons.to_crs("EPSG:4326")
    
    return points.overlay(polygons)[[point_id, polygon_id]]

def process_NRI(NRI_data):
    """
    Takes raw NRI data file and outputs trimmed version with GEOID column and metrics (e.g. total expected building damage) for event types (e.g. coastal flooding) specified as globable variables
     
    Parameters
    ----------
    NRI_data: DataFrame
        Raw NRI data from NRI website
    Returns
    ----------
    DataFrame
        NRI data for specified event types and measures. GEOID column for easy merge to census values
    """
    
    NRI_data["GEOID"] = NRI_data["NRI_ID"].str.slice(1,12) # NRI ID is GEOID with a letter in front, extracting last 11 digits gives tract-level GEOID
    category_columns = [col for col in NRI_data.columns if col[0:4] in EVENT_TYPES and col[5:len(col)] in NRI_MEASURES]
    base_columns = ["GEOID", "BUILDVALUE"]
    return NRI_data[base_columns + category_columns].reset_index(drop = True)

def create_NRI_points(NRI_data, polygons, points, quantile = 4, point_id = "stop_id", polygon_id = "GEOID", NRI_tract_id = "GEOID"):
    """
    Takes raw NRI data file and outputs trimmed version with GEOID column and metrics (e.g. total expected building damage) for event types (e.g. coastal flooding) specified as globable variables
     
    Parameters
    ----------
    NRI_data: DataFrame
        Raw NRI data from NRI website
    polygons: GeoDataFrame
        GeoDataFrame containing polygon geometry
    points: GeoDataFrame
        Geodataframe containing point geometry    
    Returns
    ----------
    DataFrame
        Point-level dataframe identifying NRI risk measures for census tract of each point
    """

    NRI_processed = process_NRI(NRI_data)
    point_crosswalk = tag_points_to_polygon(points, point_id, polygons, polygon_id)
    merged = NRI_processed.merge(point_crosswalk, left_on = NRI_tract_id, right_on = polygon_id) 
    build_cols = [col for col in merged.columns if col[-4:] == "EALB"]
    for col in build_cols:
        merged[col[0:4] + "_damage_quantile"] = pd.qcut(merged[col], quantile, duplicates = "drop")
    
    return merged


def main():
    parser = argparse.ArgumentParser("NRI Tract Merge")
    parser.add_argument("--NRI_data_path", required=True)
    parser.add_argument("--polygons_path", required=True)
    parser.add_argument("--points_path", required=True)
    parser.add_argument("--out", required=True)
    
    opts = parser.parse_args()
    points = geopd.read_file(opts.points_path)
    polygons = geopd.read_file(opts.polygons_path)
    NRI_data = pd.read_csv(opts.NRI_data_path)

    out = create_NRI_points(NRI_data, polygons, points, quantile = 4, point_id = "stop_id", polygon_id = "GEOID", NRI_tract_id = "GEOID")
    print("NRI data matched to points. Writing it") 
    out.to_csv(opts.out)
    
if __name__ == "__main__":
    main()
