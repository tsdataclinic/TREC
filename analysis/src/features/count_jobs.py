import sys
sys.path.append('../')
import src.utils.geo as areal
import geopandas as geopd
import pandas as pd
import argparse
import time

def count_all_jobs(census_geo, polygons, LODES, polygon_id_col, crs):
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
    wts = areal.calculate_areal_weights(polygons, census_geo,polygon_id_col)
    all_jobs = wts.merge(LODES[['w_geocode','S000']],how='left',right_on='w_geocode',left_on='GEOID')
    all_jobs['total_jobs'] = all_jobs.intersection_weight*all_jobs.S000
    all_jobs = all_jobs.groupby(polygon_id_col).sum()['total_jobs'].reset_index()

    return all_jobs

# def jobs_to_remove(grouped_df, lodes):
#     lodes_tmp = lodes[(lodes.w_geocode.isin(grouped_df.GEOID))&(lodes.h_geocode.isin(grouped_df.GEOID))]
#     lodes_tmp = lodes_tmp.merge(grouped_df, right_on = "GEOID", left_on = "h_geocode").merge(grouped_df, left_on = "w_geocode", right_on = "GEOID")
#     lodes_tmp['full_weight'] = lodes_tmp.intersection_weight_x * lodes_tmp.intersection_weight_y
#     lodes_tmp['jobs_weighted'] = lodes_tmp.full_weight * lodes_tmp.S000
#     return lodes_tmp.jobs_weighted.sum()

def count_jobs_to_subtract(census_geo, polygons, LODES, polygon_id_col, crs):
    """
    Computes areally interpolated estimates of number of people working inside each supplied polygons who also live in that polygon
    
    Parameters
    ----------
    Identical to count_all_jobs(..) parameters
    ----------
    DataFrame
        Summed jobs data aggregated to polygon IDs
    """
       
    wts = areal.calculate_areal_weights(polygons, census_geo,polygon_id_col)
    full_wts = wts.merge(wts,how='outer',on=polygon_id_col)
    full_wts['full_weight'] = full_wts.intersection_weight_x * full_wts.intersection_weight_y

    to_sub = full_wts[[polygon_id_col,'GEOID_x','GEOID_y','full_weight']].merge(LODES[['w_geocode','h_geocode','S000']],
                                                                           right_on=['w_geocode','h_geocode'],left_on=['GEOID_x','GEOID_y'])
    
    to_sub['jobs_to_subtract'] = to_sub.full_weight *to_sub.S000
    to_sub = to_sub.groupby(polygon_id_col).sum()['jobs_to_subtract'].reset_index()
    
    return to_sub

def count_jobs(census_geo, polygons, LODES, polygon_id_col, crs):
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
    census_geo = census_geo.to_crs(crs)
    census_geo = areal.calculate_census_areas(census_geo)

    LODES["w_geocode"] = LODES["w_geocode"].astype(str).str.slice(0,12)
    LODES["h_geocode"] = LODES["h_geocode"].astype(str).str.slice(0,12)
    LODES = LODES.groupby(["w_geocode", "h_geocode"]).agg(S000 = ("S000", "sum")).reset_index()
    LODES = LODES[(LODES.w_geocode.isin(census_geo.GEOID)) & (LODES.h_geocode.isin(census_geo.GEOID))]
    
    jobs_full = count_all_jobs(census_geo, polygons, LODES, polygon_id_col, crs)
    jobs_to_subtract = count_jobs_to_subtract(census_geo, polygons, LODES, polygon_id_col, crs)
    jobs_merged = jobs_full.merge(jobs_to_subtract, how='left')
    jobs_merged.jobs_to_subtract = jobs_merged.jobs_to_subtract.fillna(0)
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