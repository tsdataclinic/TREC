import sys
sys.path.append('../')
from src.features import areal_interpolation as areal
import geopandas as geopd
import pandas as pd
import argparse

def count_all_jobs(blocks, polygons, LODES, polygon_id_col, crs):
    """
    Computes areally interpolated estimates of total number of people working inside supplied polygons
    
    Parameters
    ----------
    blocks: GeoDataFrame
        Geodataframe containing census block geometry 
    polygons: GeoDataFrame
        Polygons to which jobs data will be aggregated to
    LODES: DataFrame
        Raw LODES data for appropriate state
    polygon_id_col: str
        String identifying column name of polygon IDs
    crs: 
        Regionally appropriate planar CRS
    Returns
    ----------
    DataFrame
        Summed jobs data aggregated to polygon IDs
    """

    LODES["GEOID"] = LODES["w_geocode"]
    LODES["S000"] = LODES["S000"].astype(int)
    LODES = LODES.groupby("GEOID").agg(total_jobs = ("S000", "sum")).reset_index()

    out = areal.areal_interpolation(blocks, LODES, polygons, polygon_id_col, ["intersection_weight"], crs).reset_index()
    return out

def jobs_to_remove(grouped_df, lodes):
    lodes_tmp = lodes[(lodes.w_geocode.isin(grouped_df.GEOID))&(lodes.h_geocode.isin(grouped_df.GEOID))]
    lodes_tmp = lodes_tmp.merge(grouped_df, right_on = "GEOID", left_on = "h_geocode").merge(grouped_df, left_on = "w_geocode", right_on = "GEOID")
    lodes_tmp['full_weight'] = lodes_tmp.intersection_weight_x * lodes_tmp.intersection_weight_y
    lodes_tmp['jobs_weighted'] = lodes_tmp.full_weight * lodes_tmp.S000
    return lodes_tmp.jobs_weighted.sum()

def count_jobs_to_subtract(blocks, polygons, LODES, polygon_id_col, crs):
    """
    Computes areally interpolated estimates of number of people working inside each supplied polygons who also live in that polygon
    
    Parameters
    ----------
    Identical to count_all_jobs(..) parameters
    ----------
    DataFrame
        Summed jobs data aggregated to polygon IDs
    """
       
        
    weights = areal.calculate_areal_weights(polygons, blocks, polygon_id_col)

    # # For use after join is completed
    # polygon_x = polygon_id_col + '_x'
    # polygon_y = polygon_id_col + '_y'
    
    LODES = LODES[(LODES.w_geocode.isin(weights.GEOID)) & (LODES.h_geocode.isin(weights.GEOID))]
    # Creating dataframe where each w_geocode and h_geocode is matched with the corresponding work/home polygons
    out = weights.groupby(polygon_id_col).apply(jobs_to_remove,LODES).reset_index().rename(columns={0:'jobs_to_subtract'})

#     jobs = (LODES
#             .merge(weights, right_on = "GEOID", left_on = "h_geocode")
#             .merge(weights, left_on = "w_geocode", right_on = "GEOID"))
    
#     # Filtering to just rows where work polygon and home polygon are the same
#     jobs_begining_ending_same_polygon = jobs[jobs[polygon_x] == jobs[polygon_y]]
    
#     jobs_begining_ending_same_polygon = jobs_begining_ending_same_polygon[[polygon_x, 
#                                                                            "w_geocode", 
#                                                                            "h_geocode",
#                                                                            "intersection_weight_x", 
#                                                                            "intersection_weight_y", 
#                                                                            "S000"]]
    
#     # Multiplying weights to account for areal overlap in both work and home polygons
#     jobs_begining_ending_same_polygon["full_weight"] = (jobs_begining_ending_same_polygon["intersection_weight_x"] * 
#                                                         jobs_begining_ending_same_polygon["intersection_weight_y"])
    
#     jobs_begining_ending_same_polygon["jobs_weighted"] = (jobs_begining_ending_same_polygon["S000"] * 
#                                                           jobs_begining_ending_same_polygon["full_weight"])
    
    # out = (jobs_begining_ending_same_polygon
    #        .groupby(polygon_x)
    #        .agg(jobs_to_subtract = ("jobs_weighted", "sum"))
    #        .reset_index()
    #        .rename({polygon_x : polygon_id_col}, axis = 1))
    
    return out

def count_jobs(blocks, polygons, LODES, polygon_id_col, crs):
    """
    Computes areally interpolated estimates number of people working inside each supplied polygons who also live in that polygon
    
    Parameters
    ----------
    Identical to count_all_jobs(..) parameters
    ----------
    DataFrame
        Summed jobs data aggregated to polygon IDs, with the non-commuters subtracted out
    """
       
    
    polygons = polygons.to_crs(crs)
    blocks = blocks.to_crs(crs)
    blocks = areal.calculate_census_areas(blocks)

    LODES["w_geocode"] = LODES["w_geocode"].astype(str)
    LODES["h_geocode"] = LODES["h_geocode"].astype(str)
    LODES = LODES[["w_geocode", "h_geocode", "S000"]]
    
    jobs_full = count_all_jobs(blocks, polygons, LODES, polygon_id_col, crs)
    jobs_to_subtract = count_jobs_to_subtract(blocks, polygons, LODES, polygon_id_col, crs)
    
    jobs_merged = jobs_full.merge(jobs_to_subtract)
    jobs_merged["jobs"] = jobs_merged["total_jobs"] - jobs_merged["jobs_to_subtract"]
    
    return jobs_merged[[polygon_id_col, "jobs"]]

def main():
    parser = argparse.ArgumentParser("NRI Tract Merge")
    parser.add_argument("--census_block_geo_path", required=True)
    parser.add_argument("--polygon_path", required=True)
    parser.add_argument("--LODES_path", required=True)
    parser.add_argument("--polygon_id_col", required=True)
    parser.add_argument("--crs", required=True)
    parser.add_argument("--out", required=True)
    
    opts = parser.parse_args()
    
    blocks = geopd.read_file(opts.census_block_geo_path)
    polygons = geopd.read_file(opts.polygon_path)
    LODES = geopd.read_file(opts.LODES_path)
    polygon_id_col = opts.polygon_id_col
    crs = opts.crs
    
    out = count_jobs(blocks, polygons, LODES, polygon_id_col, crs)
    print("Census data interpolated to polygons. Writing it") 
    out.to_csv(opts.out)
    
if __name__ == "__main__":
    main()

# python3 -m analysis.src.features.count_jobs --census_block_geo_path "/home/data/census/nyc/geo/blocks.geojson" --polygon_path "https://data.cityofnewyork.us/api/geospatial/d3qk-pfyz?method=export&format=GeoJSON" --LODES_path "/home/data/census/nyc/LODES/ny_od_main_JT01_2019.csv" --polygon_id "ntacode" --crs "EPSG:2263" --out "test.csv"
