import areal_interpolation as areal
import geopandas as geopd
import pandas as pd

census_block_geo_path = "/home/data/census/nyc/geo/blocks.geojson"
polygons_path = "https://data.cityofnewyork.us/api/geospatial/d3qk-pfyz?method=export&format=GeoJSON"
LODES_path = "/home/data/census/nyc/LODES/ny_od_main_JT01_2019.csv" 

blocks = geopd.read_file(census_block_geo_path)
polygons = geopd.read_file(polygons_path)
LODES = geopd.read_file(LODES_path)

def count_jobs(blocks, polygons, LODES, polygon_id, crs):


    LODES["GEOID"] = LODES["w_geocode"]
    LODES["S000"] = LODES["S000"].astype(int)
    LODES = LODES.groupby("GEOID").agg(jobs = ("S000", "sum")).reset_index()

    return areal.main(blocks, LODES, polygons, polygon_id, ["intersection_weight"], crs)

# count_jobs(census_blocks, polygons, LODES, polygon_id = "ntacode", crs = "EPSG:2263")S