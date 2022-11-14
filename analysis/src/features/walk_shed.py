import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from descartes import PolygonPatch
from shapely.geometry import Point, LineString, Polygon, MultiPolygon
import sys
from shapely.ops import unary_union
ox.config(log_console=True)
ox.__version__


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
    
    gdf_nodes = ox.graph_to_gdfs(graph, edges=False)
    isochrone_polys = []
    for idx, h in points.iterrows():
        node = ox.distance.nearest_nodes(graph, h.geometry.x, h.geometry.y)
        subgraph = nx.ego_graph(graph, node, radius=trip_time, distance='time')
        node_points = [Point((data['x'], data['y'])) for node, data in subgraph.nodes(data=True)]
        bounding_poly = gpd.GeoSeries(node_points).unary_union.convex_hull
        isochrone_polys.append(bounding_poly) 
        
    walksheds = gpd.GeoDataFrame(geometry=isochrone_polys)
    
    if combine==True:
        walksheds['to_combine'] = 1
        combined_walkshed = walksheds.dissolve(by='to_combine')
        return combined_walkshed
    else:
        points['walkshed_geometry'] = isochrone_polys
        points = hr_hosp_gdf.drop(columns=['geometry']).rename(columns={'walkshed_geometry':'geometry'}).set_geometry(col='geometry')
        return points
    

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
    gdf = create_walk_shed(points=points, graph=G, speed=opts.speed, trip_time=opts.time, combine=opts.combine)
    gdf.to_file(opts.out,driver='GeoJSON')
    
if __name__ == "__main__":
    main()
