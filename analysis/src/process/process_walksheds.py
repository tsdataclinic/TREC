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
import json


def fix_walkshed(graph, polygons):
    """
    Fixes walksheds for instances where the walk graph around a stop is disconnected. 
    Manual fix where a buffer of 0.01125 degrees around a stop is used. TODO: Better solution to issue
    
    Parameters
    ----------
    graph: GraphObject
        Walk graph of extent
    polygons: GeoDataFrame
        Walkshed polygons derived from `get_walkshed`.
    Returns
    ----------
    GeoDataFrame
        Walkshed polygon with lines and points replaced by polygons
    """
    nodes = ox.graph_to_gdfs(graph,nodes=True,edges=False).reset_index()
    walkshed_lines = polygons.loc[polygons.geometry.geometry.type!='Polygon']
    unique_nodes = walkshed_lines.osmid.unique()
    isochrone_polys = []
    for n in unique_nodes:
        buffer = nodes[nodes.osmid==n].geometry.buffer(.01125)
        node_points = nodes.sjoin(gpd.GeoDataFrame(geometry=buffer),how='inner',predicate='intersects').geometry
        bounding_poly = gpd.GeoSeries(node_points).unary_union.convex_hull
        isochrone_polys.append(bounding_poly)
    walksheds = gpd.GeoDataFrame(geometry=isochrone_polys)
    walksheds['osmid'] = unique_nodes
    walkshed_lines_fixed = walkshed_lines.drop(columns=['geometry']).merge(walksheds,on='osmid').set_geometry(col='geometry')
    poly_a = polygons[~polygons.id.isin(walkshed_lines_fixed.id)]
    poly_fixed = poly_a.append(walkshed_lines_fixed)
    
    return poly_fixed


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
    
def process_walksheds(config, city_key):

    graph_path = f"{config['base_path']}/cities/{city_key}/osm/walk_graph.gpickle"
    graph = nx.read_gpickle(graph_path)
    out_path = f"{config['base_path']}/cities/{city_key}/osm/walksheds/"

    print("Processing Hospital walksheds")
    hospitals_path = f"{config['base_path']}/cities/{city_key}/results/hospitals.geojson"
    points = gpd.read_file(hospitals_path)
    times = [10,20]
    for t in times:
        hosp_walkshed = create_walk_shed(points, graph, trip_time=t, combine=True)
        hosp_walkshed.to_file(out_path + f"hospitals_combined_{t}m.geojson",driver='GeoJSON')


    print("Processing Transit walksheds")
    stops_path = f"{config['base_path']}/cities/{city_key}/stops.geojson"
    points = gpd.read_file(stops_path)
    transit_walkshed = create_walk_shed(points, graph, combine=False)
    transit_walkshed_fixed = fix_walkshed(graph,transit_walkshed)
    transit_walkshed_fixed.to_file(out_path + "transit_walkshed.geojson",driver='GeoJSON')
    
    print(f"Processed walkshed polygons written to {out_path}")


def main():
    parser = argparse.ArgumentParser("Generate Walksheds")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    process_walksheds(config, opts.city)
        
if __name__ == "__main__":
    main()

    
# python3 features/walk_shed.py --points='/home/data/results/hospitals/hospitals_hampton_roads.geojson' --graph='/home/data/osm/nyc/NYC_walk_graph.gpickle' --out='/home/data/osm/nyc/walksheds/hospitals_combined_10m.geojson' --time=10 --combine=True

# python3 features/walk_shed.py --points='/home/data/results/stop_features/all_nyc_stops.geojson' --graph='/home/data/osm/nyc/NYC_walk_graph.gpickle' --out='/home/data/osm/nyc/walksheds/transit_walkshed.geojson' --time=15 --combine=False

# python3 features/walk_shed.py --points='/home/data/results/stop_features/all_hr_stops.geojson' --graph='/home/data/osm/hampton_roads/HR_walk_graph.gpickle' --out='/home/data/osm/hampton_roads/walksheds/transit_walkshed.geojson' --time=15 --combine=False