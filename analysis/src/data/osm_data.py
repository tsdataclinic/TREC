import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from descartes import PolygonPatch
from shapely.geometry import Point, LineString, Polygon, MultiPolygon
import argparse
import sys
ox.config(log_console=True)

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
    parser.add_argument("--extent", required=True)
    parser.add_argument("--out",  required=True)
    
    opts = parser.parse_args()
    G = get_walk_graph(opts.extent)
    nx.write_gpickle(G, opts.out)
    
if __name__ == "__main__":
    main()
    