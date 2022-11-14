import os
import pandas as pd
import geopandas as geopd
from shapely.geometry import Point, LineString

def make_stops(folder_path, route_type):
    
    # Load relevant gtfs elements
    routes = pd.read_csv(folder_path + "/routes.txt")
    stops = pd.read_csv(folder_path + "/stops.txt")
    trips = pd.read_csv(folder_path + "/trips.txt")
    stop_times = pd.read_csv(folder_path + "/stop_times.txt")
    
    # Get most common services for each line
    mode_trips = trips[["route_id", "service_id"]].groupby(["route_id"]).agg(pd.Series.mode).reset_index()
    trips_to_include = mode_trips.merge(trips, on = "route_id").query("service_id_y.isin(service_id_x)")[["route_id", "trip_id"]]
    
    # Final df
    trips_with_stops = trips_to_include.merge(stop_times)
    stops_with_trips = trips_with_stops.merge(stops)[["route_id", "stop_id", "stop_name", "stop_lat", "stop_lon"]].drop_duplicates().reset_index(drop = True)
    stops_with_trips["route_type"] = route_type
    
    # Add geometry
    stops_with_trips["geometry"] = geopd.points_from_xy(stops_with_trips.stop_lon, stops_with_trips.stop_lat, crs="EPSG:4326")
    stops_with_trips = geopd.GeoDataFrame(stops_with_trips, geometry = "geometry")
    
    return stops_with_trips

def make_lines(folder_path, route_type, extra_routes_to_keep):
    trips = pd.read_csv(folder_path + "/trips.txt")
    shapes = pd.read_csv(folder_path + "/shapes.txt")
    
    # Modal trip paths
    trips["route_type"] = route_type
    trips_key = trips[["shape_id", "route_id", "direction_id", "route_type"]].groupby(["direction_id","route_id", "route_type"]).agg(lambda x: pd.Series.mode(x)[0]).reset_index()
    
    # Extra routes
    extras = trips.query("shape_id.isin(@extra_routes_to_keep)")[["shape_id", "route_id", "direction_id", "route_type"]].drop_duplicates().reset_index()
    trips_key = pd.concat([trips_key, extras])
    
    # shapes_routes = shapes.merge(trips)
    shapes["geometry"] = geopd.points_from_xy(shapes.shape_pt_lon, shapes.shape_pt_lat, crs="EPSG:4326")
    shapes_points = geopd.GeoDataFrame(shapes, geometry = "geometry")

    # Points to lines
    shapes_lines = shapes_points.groupby(['shape_id'])['geometry'].apply(lambda x: LineString(x.tolist())).reset_index()
    shapes_lines = trips_key.merge(shapes_lines, how = "left")
    shapes_lines = geopd.GeoDataFrame(shapes_lines, geometry = "geometry",  crs="EPSG:4326")

    return shapes_lines

base_path = "/home/data/transit_feed_data/mta_feeds/"
write_path = "/home/data/transit_feed_data/mta_processed/"
feeds = [feed for feed in os.listdir(base_path) if os.path.isdir(base_path + feed)]

def process_stops_and_routes(feeds, write_path):
    
    stops = geopd.GeoDataFrame()
    routes = geopd.GeoDataFrame()

    for feed in feeds:
        route_type = "bus"
        if feed == "mta_subway": 
            route_type = "subway"
        feed_stops = make_stops(base_path + feed, route_type)
        feed_lines = make_lines(base_path + feed, route_type, ["A..S58R"])
        
    stops = pd.concat([stops, feed_stops])
    routes = pd.concat([routes, feed_lines])
    
    stops.to_file(home_path + "NYC_GTFS_Stops.geojson", driver='GeoJSON')
    routes.to_file(home_path + "NYC_GTFS_Routes.geojson", driver='GeoJSON')
    
#base_path = "/home/data/transit_feed_data/mta_feeds/"
#feeds = [feed for feed in os.listdir(base_path) if os.path.isdir(base_path + feed)]

#folder_path = base_path + feeds[2]

#stops = pd.read_csv(folder_path + "/stops.txt")
#stop_times = pd.read_csv(folder_path + "/stop_times.txt")
#trips = pd.read_csv(folder_path + "/trips.txt")
#shapes = pd.read_csv(folder_path + "/shapes.txt")