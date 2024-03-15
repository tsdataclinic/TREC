import pandas as pd
import geopandas as geopd
import os
import argparse
import json

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

    if 'agency_id' in routes.columns:
        agencies = pd.read_csv(folder_path + "/agency.txt", dtype = "str")
        routes = routes.merge(agencies[["agency_id", "agency_name"]])
    else:
        routes["agency_id"] = feed_name.upper()
        routes["agency_name"] = feed_name.upper()

    # Get route types
    routes["route_id"] = routes["route_id"].astype(str)
    routes_types = routes[["route_id","route_short_name", "route_type", "agency_id", "agency_name"]].drop_duplicates()
    routes_types = routes_types.replace({"route_type" : ROUTE_DICT})
    
    # Get most common services for each line
    mode_trips = trips.groupby(['route_id','direction_id','shape_id']).count().reset_index().sort_values(
    ['route_id','direction_id','service_id'],ascending=False).drop_duplicates(
    subset=['route_id','direction_id'])[['route_id','direction_id','shape_id']]
    trips_to_include = mode_trips.merge(trips, on = "route_id")[["route_id", "trip_id"]]
    
    # Final df
    trips_with_stops = trips_to_include.merge(stop_times)
    stops_with_trips = trips_with_stops.merge(stops).merge(routes_types)[["route_id", "stop_id", "route_type","route_short_name", "stop_name", "stop_lat", "stop_lon", "agency_id", "agency_name"]].drop_duplicates().reset_index(drop = True)
    stops_with_trips = stops_with_trips[stops_with_trips.route_type=='Bus']

    # Add geometry
    stops_with_trips["geometry"] = geopd.points_from_xy(stops_with_trips.stop_lon, stops_with_trips.stop_lat, crs="EPSG:4326")
    stops_with_trips = geopd.GeoDataFrame(stops_with_trips, geometry = "geometry")
    
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
        Folder path containing 2010 and 2020 tract geography, e.g. '/home/data/nyc/census/geo/'
    Returns
    ----------
    DataFrame with 2010 and 2020 tracts for each stop, in addition to original columns
    """
 
    tracts_2010 = geopd.read_file(tracts_path + "tracts_2010.geojson")[["GEOID", "geometry"]].rename({"GEOID" : "GEOID_2010"}, axis = 1)
    tracts_2020 = geopd.read_file(tracts_path + "tracts.geojson")[["GEOID", "geometry"]].rename({"GEOID" : "GEOID_2020"}, axis = 1)
    
    return stops.overlay(tracts_2010.to_crs(stops.crs)).overlay(tracts_2020.to_crs(stops.crs))
        

def process_stops(config, msa_id, out=False):
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
    
    base_path = f"{config['base_path']}/cities/{msa_id}/transit_feeds/"
    feeds = [base_path + feed for feed in os.listdir(base_path) if os.path.isdir(base_path + feed)]
    
    feed_names = [f.split('/')[-1] for f in feeds]
    feed_city_mapping = pd.DataFrame({'feed_name':feed_names,'city':msa_id})
    stops_out = geopd.GeoDataFrame()
    
    for feed in feeds:
        try:
            print("Processing feed: " + feed)
            stops = make_stops(feed)
            tract_path = f"{config['base_path']}/cities/{msa_id}/census/geo/"
            stops = tag_with_tracts(stops, tract_path)
            
            stops_out = pd.concat([stops_out, stops])
        except Exception as e:
            print(e)
    
    stops_out = stops_out.reset_index(drop=True)
    
    # Routes as list
    if 'route_short_name' in stops_out.columns:
        routes_list = stops_out.groupby('stop_id')['route_short_name'].apply(list).reset_index().rename(columns={'route_short_name':'routes_serviced'})
    else:
        routes_list = stops_out.groupby('stop_id')['route_id'].apply(list).reset_index().rename(columns={'route_id':'routes_serviced'})
    agencies_list = stops_out.groupby('stop_id')['agency_id'].apply(list).reset_index().rename(columns={'agency_id':'agency_ids_serviced'})
    agencies_name_list = stops_out.groupby('stop_id')['agency_name'].apply(list).reset_index().rename(columns={'agency_name' : 'agencies_serviced'})

    stops_out = stops_out.merge(routes_list,how='left',on='stop_id')
    stops_out = stops_out.merge(agencies_list,how='left',on='stop_id')
    stops_out = stops_out.merge(agencies_name_list,how='left',on='stop_id')

    stops_out['routes_serviced_str'] = [','.join(map(str, list(set(l)))) for l in stops_out['routes_serviced']]
    stops_out['agency_ids_serviced'] = [','.join(map(str, list(set(l)))) for l in stops_out['agency_ids_serviced']]
    stops_out['agencies_serviced'] = [','.join(map(str, list(set(l)))) for l in stops_out['agencies_serviced']]

    stops_out = stops_out.drop(["route_id", "agency_id", "agency_name"], axis = 1).drop_duplicates(subset=['stop_id']).reset_index().drop("index", axis = 1)


    stops_out = stops_out.merge(feed_city_mapping, how='left', on='feed_name')

    if out==True:
        stops_path = f"{config['base_path']}/cities/{msa_id}/stops.geojson"

        with open(stops_path, 'w') as file:
            file.write(stops_out.to_json())
        print("Stops data written to: " + stops_path) 
    else:
        return stops_out

def main():
    parser = argparse.ArgumentParser("Process transit feeds")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)

    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    base_path = f"{config['base_path']}/cities/{opts.city}/transit_feeds/"
    stops = process_stops(base_path, opts.city)
    
    stops_path = f"{config['base_path']}/cities/{opts.city}/stops.geojson"

    with open(stops_path, 'w') as file:
        file.write(stops.to_json())
    print("Stops data written to: " + stops_path) 

    
if __name__ == "__main__":
    main()
