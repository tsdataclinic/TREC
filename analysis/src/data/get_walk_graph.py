import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from descartes import PolygonPatch
from shapely.geometry import Point, LineString, Polygon, MultiPolygon
import argparse
import sys
import os
import json
ox.config(log_console=True)

BASE_PATH = 'data'

def create_extent(geo_file_path):
    """
    Creates a dissolved geography that will serve as the extent for querying OSM network data
    
    Parameters
    ----------
    geo_file_path: str
        Path to geography (tracts, blocks, NTA, etc.)
        
    Returns
    ----------
    GeoDataFrame
        Combined geography
    """
    
    gdf = gpd.read_file(geo_file_path)
    gdf['to_merge'] = 1
    
    gdf_extent = gdf.dissolve(by='to_merge')
    
    return gdf_extent


def get_walk_graph(geo_file_path, network_type='walk'):
    """
    Queries Overpass API using `osmnx` for the geographical extent in `geo_file_path` and saves the walk network to `out_path`.
    
    Parameters
    ----------
    geo_file_path: str
        Path to geography (tracts, blocks, NTA, etc.)
    network_type: str, default 'walk'
        Type of OSM network to query

    Returns
    ----------
    nx graph object
    """
    extent = create_extent(geo_file_path)
    
    ## retail_all is set to true to ensure a region isn't excluded because it is a disconnected component
    G = ox.graph_from_polygon(extent['geometry'].iloc[0], network_type=network_type, retain_all=True)
    return G


def main():
    parser = argparse.ArgumentParser("OSM Graph builder")
    parser.add_argument("--city",  required=True)
    
    opts = parser.parse_args()
    
    extent_path = f"{BASE_PATH}/cities/{opts.city}/census/geo/tracts.geojson"
    out_path = f"{BASE_PATH}/cities/{opts.city}/osm/"
    
    G = get_walk_graph(extent_path)
    print("Graph created. Writing it") 
    nx.write_gpickle(G, out_path+"walk_graph.gpickle")

    print("OSM data written") 
    
    
if __name__ == "__main__":
    main()
    