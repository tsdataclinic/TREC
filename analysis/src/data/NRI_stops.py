import pandas as pd
import geopandas as geopd

def tag_points_to_polygon(points, point_id, polygons, polygon_id, crs):
    points = points.to_crs(crs)
    polygons = polygons.to_crs(crs)
    
    return points.overlay(polygons)[[point_id, polygon_id]]

def process_NRI(NRI_data, event_types, NRI_measures):
    NRI_data["GEOID"] = NRI_data["NRI_ID"].str.slice(1,12)
    category_columns = [col for col in NRI_data.columns if col[0:4] in event_types and col[5:len(col)] in NRI_measures]
    base_columns = ["GEOID", "BUILDVALUE"]
    return NRI_data[base_columns + category_columns].reset_index(drop = True)

def main_NRI(NRI_data_path, polygons_path, stops_path, event_types, NRI_measures, quantile, point_id = "stop_id", polygon_id = "GEOID", NRI_tract_id = "GEOID", crs = "EPSG:4326"):
    points = geopd.read_file(stops_path)
    polygons = geopd.read_file(polygons_path)
    NRI_data = pd.read_csv(polygon_data_path)
    NRI_processed = process_NRI(NRI_data, event_types, NRI_measures)
    point_crosswalk = tag_points_to_polygon(points, "stop_id", polygons, "GEOID", crs)
    merged = NRI_processed.merge(point_crosswalk, left_on = NRI_tract_id, right_on = polygon_id) 
    build_cols = [col for col in merged.columns if col[-4:] == "EALB"]
    for col in build_cols:
        merged[col[0:4] + "damage_quantile"] = pd.qcut(merged[col], quantile, duplicates = "drop")
    
    return merged

#stops_path = "/home/data/transit_feed_data/mta_processed/NYC_GTFS_Stops.geojson"
#polygons_path = "/home/data/census/nyc/geo/nyc_tracts.geojson"
#NRI_data_path = "/home/data/national_risk_index/NRI_Table_CensusTracts.csv"
#crs = "EPSG:4326"

#main_NRI(NRI_data_path, polygons_path, stops_path, output_path, ["CFLD"], ["AFREQ", "EALB"], 5, point_id = "stop_id", polygon_id = "GEOID", NRI_tract_id = "GEOID", crs = "EPSG:4326")