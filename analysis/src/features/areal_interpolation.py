import geopandas as geopd
import pandas as pd
import argparse

def calculate_census_areas(census_geo):
    """
    Calculate area of census geometries to
    
    Parameters
    ----------
    census_geo: GeoDataFrame
        Geodataframe containing census defined polygon geometry
    Returns
    ----------
    GeoDataFrame
        Census data augmented with area column
    """
    
    census_geo["census_area"] = census_geo.area
    return census_geo
        
def calculate_areal_weights(polygons, census_geo, polygon_id_col):        
    """
    Calculates percentage of census geometries contained within each supplied polygons
    
    Parameters
    ----------
    polygons: GeoDataFrame
        GeoDataFrame containing polygons to interpolate
    census_geo: GeoDataFrame
        Geodataframe containing census defined polygon geometry - must have area column
    polygon_id_col: str
        String identifying column name of polygon IDs
    Returns
    ----------
    DataFrame
        Weights associated with GEOIDs, polygon IDs
    """
    
    intersected_polygons = polygons.overlay(census_geo)
    intersected_polygons["intersection_area"] = intersected_polygons.area
    intersected_polygons["intersection_weight"] =   intersected_polygons["intersection_area"] / intersected_polygons["census_area"]
    intersection_weights = intersected_polygons[[polygon_id_col, "GEOID", "intersection_weight"]]
    return intersection_weights

def aggregate_values(census_data, areal_weights, polygon_id_col, drop_cols = ["NAME", "intersection_weight"]):
    """
    Calculates percentage of census geometries contained within each supplied polygons
    
    Parameters
    ----------
    census_data: DataFrame
        Tabular census data aggregated at level of census_geo
    areal_weights: DataFrame
        Output from calculate_areal_weights()
    polygon_id_col: str
        String identifying column name of polygon IDs
    drop_cols: list
        List of columns in census_data that should not be aggregated up
    Returns
    ----------
    DataFrame
        Weights associated with GEOIDs, polygon IDs
    """
    
    
    census_data["GEOID"] = census_data["GEOID"].astype(str)
    areal_weights["GEOID"] = areal_weights["GEOID"].astype(str)

    census_areal = census_data.merge(areal_weights, how = "inner")
    census_values = census_areal.drop(["GEOID"] + drop_cols, axis = 1)
    census_values.iloc[:, census_values.columns != polygon_id_col] = census_values.iloc[:, census_values.columns != polygon_id_col].apply(pd.to_numeric, errors='coerce')
    sums = pd.concat([census_values.iloc[:, census_values.columns != polygon_id_col].multiply(census_areal["intersection_weight"], axis = "index"),census_values[polygon_id_col]], axis = 1).groupby(polygon_id_col).sum() 
    return sums

def areal_interpolation(census_geo, census_data, polygons, polygon_id_col, drop_cols = ["NAME", "intersection_weight"], crs = "EPSG:2263"):
    """
    Computes areally interpolated sums of census data for supplied polygons, given census data and geographic boundaries
    
    Parameters
    ----------
    census_geo: GeoDataFrame
        Geodataframe containing census defined polygon geometry
    census_data: DataFrame
        Tabular census data aggregated at level of census_geo
    polygons: GeoDataFrame
        Polygons to which census data will be aggregated to
    polygon_id_col: str
        String identifying column name of polygon IDs
    drop_cols: list
        List of columns in census_data that should not be aggregated up
    crs: 
        Regionally appropriate planar CRS
    Returns
    ----------
    DataFrame
        Summed census data aggregated to polygon IDs
    """
    census_geo = census_geo.to_crs(crs)
    polygons = polygons.to_crs(crs)
    
    census_geo = calculate_census_areas(census_geo)
    areal_weights = calculate_areal_weights(polygons, census_geo, polygon_id_col)
    sums = aggregate_values(census_data, areal_weights, polygon_id_col, drop_cols)
    
    return sums


def main():
    parser = argparse.ArgumentParser("NRI Tract Merge")
    parser.add_argument("--census_geo_path", required=True)
    parser.add_argument("--census_data_path", required=True)
    parser.add_argument("--polygon_path", required=True)
    parser.add_argument("--polygon_id_col", required=True)
    parser.add_argument("--out", required=True)
    
    opts = parser.parse_args()
    census_geo = geopd.read_file(opts.census_geo_path)
    census_data = pd.read_csv(opts.census_data_path)
    polygons = geopd.read_file(opts.polygon_path)
    polygon_id_col = opts.polygon_id_col
    
    out = areal_interpolation(census_geo, census_data, polygons, polygon_id_col)
    print("Census data interpolated to polygons. Writing it") 
    out.to_csv(opts.out)
    
if __name__ == "__main__":
    main()
