import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys 
sys.path.append('../')
import argparse
from data.get_LODES import concatenate_LODES
from process.process_fsf import process_fsf
from features.count_jobs import count_jobs
from features.jobs_vulnerability import get_worker_svi
from utils.crosswalks import get_states_in_msa
import json

COLUMNS_TO_KEEP = ["stop_id", 
        "stop_name",
        "agency_ids_serviced",
        "agencies_serviced",
        "city",
        "route_type",
        "routes_serviced",
        "routes_serviced_str",
        "flood_risk_category_national",
        "flood_risk_category_local",
        "flood_risk_score",
        "heat_risk_category_national",
        "heat_risk_category_local",
        "heat_risk_score",
        "fire_risk_category_national",
        "fire_risk_category_local",
        "fire_risk_score",
        "job_access_category",
        "jobs_access_count",
        "worker_vulnerability_category",
        "worker_vulnerability_score",
        "access_to_hospital_category",
        "geometry"]


def add_fs_flood_risk(stops, config):
    """
    Adds flood risk based on First Street Foundation's data
    
    Parameters
    ----------
    stops: GeoDataFrame
        
    Returns
    ----------
    GeoDataFrame
        Adds flood risk columns to stops file
    """
    fsf_feature = process_fsf(config)
    
    stops = stops.merge(fsf_feature[['GEOID','flood_risk_score','flood_pct_moderate_plus','flood_risk_category_national',
                                     'heat_risk_score','heat_pct_moderate_plus','heat_risk_category_national',
                                     'fire_risk_score','fire_pct_moderate_plus','fire_risk_category_national',
                                     ]],how='left',
                        left_on = "GEOID_2020", right_on = "GEOID")
    
    paths = config["national"]["fsf_climate_risk"]
    for risk in paths.keys():
        stops[f"{risk}_risk_category_local"] = pd.qcut(stops[f"{risk}_pct_moderate_plus"], 3, labels=False, duplicates='drop')
        
    return stops


def get_hospital_walkshed(config, msa_id):
    """
    Loads the raw hospital walksheds for (10 and 20 mins) and creates polygons for High and Medium access to hospitals
    
        
    Returns
    ----------
    GeoDataFrame
        High hospital access areas (10min walking distance)
    GeoDataFrame
        Medium hospital access areas (20min walking distance)
    """
    
    HIGH_PATH = f"{config['base_path']}/cities/{msa_id}/osm/walksheds/hospitals_combined_10m.geojson"
    MED_PATH = f"{config['base_path']}/cities/{msa_id}/osm/walksheds/hospitals_combined_20m.geojson"
    
    high_access_polys = gpd.read_file(HIGH_PATH).set_crs(epsg=4326)
    med_access_polys = gpd.read_file(MED_PATH).set_crs(epsg=4326)
    
    med_access_polys = gpd.GeoDataFrame(geometry=med_access_polys.difference(high_access_polys))
    
    return high_access_polys, med_access_polys
            
        
def add_hospital_access(stops, config, msa_id):
    """
    Adds Hospital access feature to stops file
    
    Parameters
    ----------
    stops: GeoDataFrame
        
    Returns
    ----------
    GeoDataFrame
        Stops file with access_to_hospital feature
    """

    high, med = get_hospital_walkshed(config, msa_id)
    high_idx = gpd.sjoin(stops, high, predicate='within').index
    med_idx = gpd.sjoin(stops, med, predicate='within').index
    
    stops['access_to_hospital_category'] = 0
    stops.loc[stops.index.isin(med_idx),'access_to_hospital_category'] = 1
    stops.loc[stops.index.isin(high_idx),'access_to_hospital_category'] = 2
    
    return stops


def get_job_counts(config, msa_id):
    """
    Returns job counts for each transit walkshed using blocks and lodes data
        
    Returns
    ----------
    GeoDataFrame
        Transit walkshed file with job counts included
    """

    TRANSIT_WALKSHED_PATH =  f"{config['base_path']}/cities/{msa_id}/osm/walksheds/transit_walkshed.geojson"
    BLOCK_GROUPS_PATH = f"{config['base_path']}/cities/{msa_id}/census/geo/block_groups.geojson"
    # LODES_PATH = f"{config['base_path']}/cities/{msa_id}/census/LODES/{config[msa_id]['state']}_od_main_JT01_2020.csv"


    walksheds = gpd.read_file(TRANSIT_WALKSHED_PATH)
    # lodes = pd.read_csv(LODES_PATH,dtype={'w_geocode':str,'h_geocode':str})
    lodes = concatenate_LODES(config,state_codes=get_states_in_msa(config,msa_id))
    block_groups = gpd.read_file(BLOCK_GROUPS_PATH)
    block_groups = block_groups.drop_duplicates()
    
    
    print("Getting jobs")
    jobs = count_jobs(census_geo=block_groups, polygons=walksheds, 
                          LODES=lodes, polygon_id_col='stop_id', crs='epsg:2263')

    
    jobs['job_access_category'] = pd.qcut(jobs['jobs'], 3, labels=False, duplicates='drop')
    jobs = jobs.rename(columns={'jobs':'jobs_access_count'})
    # print(jobs.shape)
    return jobs[['stop_id','jobs_access_count','job_access_category']]

def add_jobs_feature(stops, config, msa_id):
    """
    Adds job count feature to stops file
    
    Parameters
    ----------
    stops: GeoDataFrame
        
    Returns
    ----------
    GeoDataFrame
        Stops file with job count features
    """
    jobs = get_job_counts(config, msa_id)

    stops = stops.merge(jobs, how='inner', on='stop_id')
    
    return stops


def get_svi(config, msa_id):
    
    TRANSIT_WALKSHED_PATH =  f"{config['base_path']}/cities/{msa_id}/osm/walksheds/transit_walkshed.geojson"
    TRACTS_PATH = f"{config['base_path']}/cities/{msa_id}/census/geo/tracts.geojson"
    # LODES_PATH = f"{config['base_path']}/cities/{msa_id}/census/LODES/{config[msa_id]['state']}_od_main_JT01_2020.csv"
    SVI_PATH = f"{config['base_path']}/national/SVI2020_US.csv"

    walksheds = gpd.read_file(TRANSIT_WALKSHED_PATH)
    # lodes = pd.read_csv(LODES_PATH,dtype={'w_geocode':str,'h_geocode':str})
    lodes = concatenate_LODES(config,state_codes=get_states_in_msa(config,msa_id))
    tracts = gpd.read_file(TRACTS_PATH)
    tracts = tracts.drop_duplicates()
    svi = pd.read_csv(SVI_PATH,dtype={'FIPS':str})

    print("Getting SVI")
    vulnerable_workers = get_worker_svi(lodes=lodes, svi=svi, census_geo=tracts, polygons=walksheds, polygon_id_col='stop_id', crs='epsg:2263')
        
    vulnerable_workers['worker_vulnerability_category'] = pd.qcut(vulnerable_workers['SVI_total'], 3, labels=False, duplicates='drop')
    vulnerable_workers = vulnerable_workers.rename(columns={'SVI_total':'worker_vulnerability_score'})
    
    
    return vulnerable_workers[['stop_id','worker_vulnerability_score', 'SVI_SES', 'SVI_household', 'SVI_race','SVI_housing_transport','worker_vulnerability_category']]


def add_vulnerable_workers_feature(stops, config, msa_id):
    
    vulnerable_workers = get_svi(config, msa_id)
    stops = stops.merge(vulnerable_workers, how='inner', on='stop_id')
    
    return stops


def get_stops_features(config, msa_id, out=False):
    """
    Function that builds the combined feature file
    - Builds stops from feeds
    - Adds FSF flood risk
    - Adds NRI Flood risk
    - Adds access to hospitals
    - Adds job counts
    
    Parameters
    ----------
    stops: GeoDataFrame
        
    Returns
    ----------
    GeoDataFrame
        Stops file with access_to_hospital feature
    """
    STOPS_PATH = f"{config['base_path']}/cities/{msa_id}/stops.geojson"

    stops = gpd.read_file(STOPS_PATH)
    # print(stops.shape)

    print("Adding First St. flood risk")
    stops = add_fs_flood_risk(stops, config)
    # print(stops.shape)
    print("Adding Hospital Access")
    stops = add_hospital_access(stops, config, msa_id)
    # print(stops.shape)
    print("Adding Number of jobs")
    stops = add_jobs_feature(stops, config, msa_id)
    # print(stops.shape)
    print("Adding Worker vulnerability")
    stops = add_vulnerable_workers_feature(stops, config, msa_id)
    # print(stops.shape)
    print("Added all features")
    stops = stops[COLUMNS_TO_KEEP]
    
    if out == True:
        out_path = f"{config['base_path']}/cities/{msa_id}/results/stop_features.geojson"

        print(f"Writing feature file to {out_path}")
        with open(out_path, 'w') as file:
            file.write(stops.to_json())
    else:
        return stops

def main():
    parser = argparse.ArgumentParser("Create stop features")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", default=False, required=False)
    
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)
    
    if opts.city:
        msa_ids = str.split(opts.city,",")
    else: 
        msa_ids = config["MSA"]
    
    for msa_id in msa_ids:
        stop_features = get_stops_features(config, msa_id)
        stop_features = stop_features[COLUMNS_TO_KEEP]

        out_path = f"{config['base_path']}/cities/{msa_id}/results/stop_features.geojson"
    
        print(f"Writing feature file to {out_path}")
        with open(out_path, 'w') as file:
            file.write(stop_features.to_json())

if __name__ == "__main__":
    main()
