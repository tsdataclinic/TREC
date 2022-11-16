import areal_interpolation as areal
import geopandas as geopd
import pandas as pd
import argparse

def count_jobs(blocks, polygons, LODES, polygon_id_col, crs):
    """
    Computes areally interpolated sums total number of people working inside supplied polygons
    
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
    LODES = LODES.groupby("GEOID").agg(jobs = ("S000", "sum")).reset_index()

    return areal.areal_interpolation(blocks, LODES, polygons, polygon_id_col, ["intersection_weight"], crs)

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

# python3 count_jobs.py --census_block_geo_path "/home/data/census/nyc/geo/blocks.geojson" --polygon_path "https://data.cityofnewyork.us/api/geospatial/d3qk-pfyz?method=export&format=GeoJSON" --LODES_path "/home/data/census/nyc/LODES/ny_od_main_JT01_2019.csv" --polygon_id "ntacode" --crs "EPSG:2263" --out "test.csv"
