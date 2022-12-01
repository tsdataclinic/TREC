import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from descartes import PolygonPatch
import argparse
from shapely.geometry import Point, LineString, Polygon, MultiPolygon
import sys
from shapely.ops import unary_union
import numpy as np
ox.config(log_console=True)
ox.__version__


def points_to_nodes(points,graph):
    """
    Mapping each point to the nearest node on a graph to reduce the number of walksheds to calculate.
    
    Parameters
    ----------
    points: GeoDataFrame
        Set of points for which the walkshed needs to be computed
    graph: NX graph
        A NX graph object of the walkgraph
    Returns
    ----------
    GeoDataFrame
        For each row in points, the osmid of its nearest node
    """
    if 'index_left' in points.columns:
        points = points.drop(columns=['index_left'])
    if 'index_right' in points.columns:
        points = points.drop(columns=['index_right'])
        
    nodes = ox.graph_to_gdfs(graph,nodes=True,edges=False).reset_index()
    nearest_nodes = points.sjoin_nearest(nodes,how='left')
    return nearest_nodes


def create_walk_shed(points, graph, speed=4.5, trip_time=15, combine=False):
    """
    Given the walkgraph and a set of points, generates the walkshed 
    
    Parameters
    ----------
    points: GeoDataFrame
        Set of points for which the walkshed needs to be computed
    graph: NX graph
        A NX graph object of the walkgraph
    speed: float
        Walking speed in km/hr
    trip_time: float
        Time radius for walkshed
    combine: Boolean
        Whether the set of polygons should be dissolved into one polygon
        
    Returns
    ----------
    GeoDataFrame
        For each row in points, a polygon geometry of the walkshed or a single polygon if combine=True
    """

    graph = ox.project_graph(graph, to_crs='epsg:4326')
    meters_per_minute = speed * 1000 / 60 #km per hour to m per minute
    for u, v, k, data in graph.edges(data=True, keys=True):
        data['time'] = data['length'] / meters_per_minute
    
    nearest_nodes = points_to_nodes(points,graph)
    unique_nodes = nearest_nodes.osmid.unique()
    isochrone_polys = []
    for n in unique_nodes:
        subgraph = nx.ego_graph(graph, n, radius=trip_time, distance='time')
        node_points = [Point((data['x'], data['y'])) for node, data in subgraph.nodes(data=True)]
        bounding_poly = gpd.GeoSeries(node_points).unary_union.convex_hull
        isochrone_polys.append(bounding_poly) 
        
    walksheds = gpd.GeoDataFrame(geometry=isochrone_polys)
    walksheds['osmid'] = unique_nodes
    
    if combine==True:
        walksheds['to_combine'] = 1
        combined_walkshed = walksheds.dissolve(by='to_combine')
        return combined_walkshed
    else:
        nearest_nodes = nearest_nodes.drop(columns=['geometry'])
        point_walkshed = nearest_nodes.merge(walksheds,how='left', on='osmid')
        point_walkshed = point_walkshed.set_geometry(col='geometry')
        return point_walkshed
    

def main():
    parser = argparse.ArgumentParser("Generate Walksheds")
    parser.add_argument("--points", required=True)
    parser.add_argument("--graph",  required=True)
    parser.add_argument("--out",  required=True)
    parser.add_argument("--speed",  required=False, default=4.5)
    parser.add_argument("--time",  required=False, default=15)
    parser.add_argument("--combine",  required=False, default=False)
    
    opts = parser.parse_args()
    
    G = nx.read_gpickle(opts.graph)
    points = gpd.read_file(opts.points)
    t = float(opts.time)
    
    gdf = create_walk_shed(points=points, graph=G, speed=opts.speed, trip_time=t, combine=opts.combine)
    gdf.to_file(opts.out,driver='GeoJSON')
    
if __name__ == "__main__":
    main()

# python3 features/walk_shed.py --points='/home/data/results/hospitals/hospitals_hampton_roads.geojson' --graph='/home/data/osm/nyc/NYC_walk_graph.gpickle' --out='/home/data/osm/nyc/walksheds/hospitals_combined_10m.geojson' --time=10 --combine=True