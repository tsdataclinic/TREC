import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from descartes import PolygonPatch
from shapely.geometry import Point, LineString, Polygon, MultiPolygon
from src.utils.geo import create_extent
import argparse
import sys
import os
import json
ox.config(log_console=True)


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

def get_osm_data(config, city_key):
    extent_path = f"{config['base_path']}/cities/{city_key}/census/geo/tracts.geojson"
    out_path = f"{config['base_path']}/cities/{city_key}/osm/"
    
    G = get_walk_graph(extent_path)
    print("Graph created. Writing it") 
    nx.write_gpickle(G, out_path+"walk_graph.gpickle")

def main():
    parser = argparse.ArgumentParser("OSM Graph builder")
    parser.add_argument("--config",  required=True)
    parser.add_argument("--city",  required=True)
    
    opts = parser.parse_args()
    with open(opts.config) as f:
        config = json.load(f)

    get_osm_data(config, opts.city)
    print("OSM data written") 
    
    
if __name__ == "__main__":
    main()
    