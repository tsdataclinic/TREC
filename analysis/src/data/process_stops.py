import pandas as pd
import geopandas as geopd
import os
import argparse

ROUTE_DICT = {'0' : "Tram",
'1' : "Subway",
'2' : "Rail",
'3' : "Bus",
'4' : "Ferry",
'5' : "Cable tram",
'6' : "Aerial lift",
'7' : "Funicular",
'11': "Trolleybus",
'12': "Monorail"}

BASE_PATHS = ["/home/data/transit_feed_data/mta_feeds/", "/home/data/transit_feed_data/hrt_feeds/"]
CITY_LIST = ['NYC', 'Hampton Roads']

def make_stops(folder_path):
    """
    Loads and processes relevant GTFS files to create feed-level dataset 
    
    Parameters
    ----------
    folder_path: str
        Path of GTFS feed, e.g. "/home/data/transit_feed_data/mta_feeds/mta_subway"
    Returns
    ----------
    DataFrame with the following features: stop_id, stop_name, routes_serviced, lat/lon, (point) geometry
    """
    
    feed_name = folder_path.split('/')[-1]

    # Load relevant gtfs elements
    routes = pd.read_csv(folder_path + "/routes.txt", dtype = "str")
    stops = pd.read_csv(folder_path + "/stops.txt", dtype = "str")
    trips = pd.read_csv(folder_path + "/trips.txt", dtype = "str")
    stop_times = pd.read_csv(folder_path + "/stop_times.txt", dtype = "str")
    
    # Get route types
    routes["route_id"] = routes["route_id"].astype(str)
    routes_types = routes[["route_id", "route_type"]].drop_duplicates()
    routes_types = routes_types.replace({"route_type" : ROUTE_DICT})
    
    # Get most common services for each line
    mode_trips = trips[["route_id", "service_id"]].groupby(["route_id"]).agg(pd.Series.mode).reset_index()
    trips_to_include = mode_trips.merge(trips, on = "route_id").query("service_id_y.isin(service_id_x)")[["route_id", "trip_id"]]
    
    # Final df
    trips_with_stops = trips_to_include.merge(stop_times)
    stops_with_trips = trips_with_stops.merge(stops).merge(routes_types)[["route_id", "stop_id", "route_type", "stop_name", "stop_lat", "stop_lon"]].drop_duplicates().reset_index(drop = True)
    
    # Add geometry
    stops_with_trips["geometry"] = geopd.points_from_xy(stops_with_trips.stop_lon, stops_with_trips.stop_lat, crs="EPSG:4326")
    stops_with_trips = geopd.GeoDataFrame(stops_with_trips, geometry = "geometry")
    
    # Routes as strings
    stops_with_trips["routes_serviced"] = stops_with_trips.groupby("stop_id")["route_id"].transform(lambda x : ', '.join(x))
    stops_with_trips = stops_with_trips.drop("route_id", axis = 1).drop_duplicates().reset_index().drop("index", axis = 1)
    stops_with_trips["feed_name"] = feed_name
    
    return stops_with_trips

def tag_with_tracts(stops, tracts_path):
    """
    Associates each stop with the 2010 and 2020 census tract in which the stop resides
    
    Parameters
    ----------
    stops: DataFrame
        Dataframe output from make_stops()
    tracts_path: str
        Folder path containing 2010 and 2020 tract geography, e.g. '/home/data/census/nyc/geo/'
    Returns
    ----------
    DataFrame with 2010 and 2020 tracts for each stop, in addition to original columns
    """
 
    tracts_2010 = geopd.read_file(tracts_path + "tracts_2010.geojson")[["GEOID", "geometry"]].rename({"GEOID" : "GEOID_2010"}, axis = 1)
    tracts_2020 = geopd.read_file(tracts_path + "tracts.geojson")[["GEOID", "geometry"]].rename({"GEOID" : "GEOID_2020"}, axis = 1)
    
    return stops.overlay(tracts_2010).overlay(tracts_2020)

def get_tract_path(feed_path):
    """
    Helper function to identify location of tract geo folder using feed path. Must be updated if a new city is added
    
    Parameters
    ----------
    feed_path: str
        GTFS feed path e.g. "/home/data/transit_feed_data/mta_feeds"
    Returns
    ----------
    String specifying folder with appropriate geo data
    """

    region_folder = feed_path.split('/')[-2]
    
    if region_folder == "mta_feeds":
        return '/home/data/census/nyc/geo/'
    elif region_folder == "hrt_feeds":
        return '/home/data/census/hampton_roads/geo/'
    else:
        raise Exception("Error: Please add tract geojson paths to get_tract_path")
        
def process_feeds(base_paths=BASE_PATHS, city_list=CITY_LIST):
    """
    Takes list of paths containing (potentially) multiple GTFS feed folders and, for each such folder, applies make_stops() and concatenates the result into full table
    
    Parameters
    ----------
    base_paths: list
        List of folders that contain GTFS feeds (and no other sub-directories) ["/home/data/transit_feed_data/mta_feeds/", "/home/data/transit_feed_data/hrt_feeds/"]
    Returns
    ----------
    DataFrame combining stops from all feeds
    """
    
    feeds = []
    cities = []
    idx = 0
    for path in base_paths:
        feeds = feeds + [path + feed for feed in os.listdir(path) if os.path.isdir(path + feed)]
        cities = cities + [city_list[idx] for feed in os.listdir(path) if os.path.isdir(path + feed)]
        idx = idx + 1
    
    feed_names = [f.split('/')[-1] for f in feeds]
    feed_city_mapping = pd.DataFrame({'feed_name':feed_names,'city':cities})
    stops_out = geopd.GeoDataFrame()
    
    for feed in feeds:
        print("Processing feed: " + feed)
        stops = make_stops(feed)
        tract_path = get_tract_path(feed)
        stops = tag_with_tracts(stops, tract_path)
        
        stops_out = pd.concat([stops_out, stops])
    
    stops_out = stops_out.reset_index(drop=True)
    stops_out = stops_out.merge(feed_city_mapping, how='left', on='feed_name')
    return stops_out

def main():
    parser = argparse.ArgumentParser("Process stops")
    parser.add_argument("--output_path", required=True)

    opts = parser.parse_args()
    output_path = opts.output_path
    
    stops = process_feeds(BASE_PATHS)
    stops.to_file(output_path + "GTFS_stops_processed.geojson")
    print("Stops data written to: " + output_path + "GTFS_stops_processed.geojson") 
    
if __name__ == "__main__":
    main()
    
# python3 -m analysis.src.data.process_stops --output_path "/home/data/results/GTFS_stops_processed.geojson"