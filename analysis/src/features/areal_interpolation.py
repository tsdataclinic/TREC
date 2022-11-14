import geopandas as geopd
import pandas as pd
    
def calculate_census_areas(census_geo):
    census_geo["census_area"] = census_geo.area
    return census_geo
        
def calculate_areal_weights(polygons, census_geo, polygon_id_col):        

    intersected_polygons = polygons.overlay(census_geo)
    intersected_polygons["intersection_area"] = intersected_polygons.area
    intersected_polygons["intersection_weight"] =   intersected_polygons["intersection_area"] / intersected_polygons["census_area"]
    intersection_weights = intersected_polygons[[polygon_id_col, "GEOID", "intersection_weight"]]
    return intersection_weights

def aggregate_values(census_data, areal_weights, polygon_id_col, drop_cols = ["NAME", "intersection_weight"]):
    
    census_data["GEOID"] = census_data["GEOID"].astype(str)
    areal_weights["GEOID"] = areal_weights["GEOID"].astype(str)

    census_areal = census_data.merge(areal_weights, how = "inner")
    census_values = census_areal.drop(["GEOID"] + drop_cols, axis = 1)
    census_values.iloc[:, census_values.columns != polygon_id_col] = census_values.iloc[:, census_values.columns != polygon_id_col].apply(pd.to_numeric, errors='coerce')
    sums = pd.concat([census_values.iloc[:, census_values.columns != polygon_id_col].multiply(census_areal["intersection_weight"], axis = "index"),census_values[polygon_id_col]], axis = 1).groupby(polygon_id_col).sum() 
    return sums

def main(census_geo, census_data, polygons, polygon_id_col, drop_cols = ["NAME", "intersection_weight"], crs = "EPSG:2263"):
    
    census_geo = census_geo.to_crs(crs)
    polygons = polygons.to_crs(crs)
    
    census_geo = calculate_census_areas(census_geo)
    areal_weights = calculate_areal_weights(polygons, census_geo, polygon_id_col)
    sums = aggregate_values(census_data, areal_weights, polygon_id_col, drop_cols)
    
    return sums