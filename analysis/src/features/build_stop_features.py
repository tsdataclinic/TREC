import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys
sys.path.append('../')
import argparse
from src.data.process_stops import process_feeds
from src.data.process_fsf import process_fsf
from src.features.count_jobs import count_jobs
from src.features.jobs_vulnerability import get_worker_svi

BASE_WALKSHED_PATH = '/home/data/osm/'
CITY_DIRS = ['nyc','hampton_roads']

NRI_DATA_PATH ='/home/data/results/climate_risk/NRI_processed.csv'
NYC_TRANSIT_WALKSHED = '/home/data/osm/nyc/walksheds/transit_walkshed_fixed.geojson'
HR_TRANSIT_WALKSHED = '/home/data/osm/hampton_roads/walksheds/transit_walkshed_fixed.geojson'

NYC_WALK_GRAPH = '/home/data/osm/nyc/NYC_walk_graph.gpickle'
HR_WALK_GRAPH = '/home/data/osm/hampton_roads/HR_walk_graph.gpickle'

NYC_LODES = '/home/data/census/nyc/LODES/ny_od_main_JT01_2019.csv'
HR_LODES = '/home/data/census/hampton_roads/LODES/va_od_main_JT01_2019.csv'

NYC_BLOCKS = '/home/data/census/nyc/geo/blocks.geojson'
HR_BLOCKS = '/home/data/census/hampton_roads/geo/blocks.geojson'

NYC_TRACTS = '/home/data/census/nyc/geo/tracts.geojson'
HR_TRACTS = '/home/data/census/hampton_roads/geo/tracts.geojson'

SVI_PATH = '/home/data/social_vulnerability_index/SVI2020_US.csv'

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

def add_fs_flood_risk(stops):
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
    fsf_feature = process_fsf()
    
    stops = stops.merge(fsf_feature[['GEOID','risk_score','pct_moderate_plus','risk_category']],how='left',
                        left_on = "GEOID_2020", right_on = "GEOID")
    
    return stops


def load_NRI_data():
    """
    Loads and minimallyprocesses NRI data for featurization
        
    Returns
    ----------
    DataFrame
        NRI file with cleaned columns for risk calculations
    """
    NRI_data = pd.read_csv(NRI_DATA_PATH)
    NRI_data["GEOID"] = NRI_data["GEOID"].astype(str).str.zfill(11)
    
    NRI_data['CFLD_AFREQ'] = NRI_data['CFLD_AFREQ'].fillna(0)
    NRI_data['CFLD_EALB'] = NRI_data['CFLD_EALB'].fillna(0)
    
    return NRI_data[['GEOID','CFLD_AFREQ','CFLD_EALB']]


def add_NRI_flood_risk(stops):
    """
    Adds flood risk based on National Risk Index data
    
    Parameters
    ----------
    stops: GeoDataFrame
        
    Returns
    ----------
    GeoDataFrame
        Adds coastal flooding risk columns to stops file
    """
    NRI_data = load_NRI_data()
    stops = stops.merge(NRI_data, how='left', left_on = "GEOID_2010", right_on = "GEOID")
    stops['CFLD_damage_quantile'] = pd.qcut(stops['CFLD_EALB'], 3, labels=False, duplicates='drop')
    stops['CFLD_freq_quantile'] = pd.qcut(stops['CFLD_AFREQ'], 3, labels=False, duplicates='drop')
    
    return stops


def get_hospital_walkshed():
    """
    Loads the raw hospital walksheds for (10 and 20 mins) and creates polygons for High and Medium access to hospitals
    
        
    Returns
    ----------
    GeoDataFrame
        High hospital access areas (10min walking distance)
    GeoDataFrame
        Medium hospital access areas (20min walking distance)
    """
    
    base_path=BASE_WALKSHED_PATH
    cities=CITY_DIRS
    
    walkshed_path = 'walksheds/hospitals_combined_{}m.geojson'
    
    high_access_polys = gpd.GeoDataFrame()
    med_access_polys = gpd.GeoDataFrame()
    
    for c in cities:
        high_path = base_path + c + '/' + walkshed_path.format(10)
        high_access_polys = high_access_polys.append(gpd.read_file(high_path))
        med_path = base_path + c + '/' + walkshed_path.format(20)
        med_access_polys = med_access_polys.append(gpd.read_file(med_path))
    
    med_access_polys = gpd.GeoDataFrame(geometry=med_access_polys.difference(high_access_polys))
    
    high_access_polys = high_access_polys.set_crs(epsg=4326)
    med_access_polys = med_access_polys.set_crs(epsg=4326)
    
    return high_access_polys, med_access_polys
            
        
def add_hospital_access(stops):
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

    high, med = get_hospital_walkshed()
    high_idx = gpd.sjoin(stops, high, predicate='within').index
    med_idx = gpd.sjoin(stops, med, predicate='within').index
    
    stops['access_to_hospital'] = 0
    stops.loc[stops.index.isin(med_idx),'access_to_hospital'] = 1
    stops.loc[stops.index.isin(high_idx),'access_to_hospital'] = 2
    
    return stops


# Add job info
def get_transit_walksheds():
    """
    Gets the raw transit walkshed files and fixes any erroneous (Points, lines) walksheds
    
        
    Returns
    ----------
    GeoDataFrame
        Polygon of walksheds for each stop for NYC
    GeoDataFrame
        Polygon of walksheds for each stop for Hampton Roads
    """

    nyc_poly = gpd.read_file(NYC_TRANSIT_WALKSHED)
    hr_poly = gpd.read_file(HR_TRANSIT_WALKSHED)
        
#     nyc_poly = nyc_poly.reset_index().rename(columns={'index':'id'})
#     hr_poly = hr_poly.reset_index().rename(columns={'index':'id'})
    
#     nyc_graph = nx.read_gpickle(NYC_WALK_GRAPH)
#     hr_graph = nx.read_gpickle(HR_WALK_GRAPH)
    
#     nyc_poly_fixed = fix_walkshed(nyc_graph, nyc_poly)
#     hr_poly_fixed = fix_walkshed(hr_graph, hr_poly)
    
    # return nyc_poly_fixed,hr_poly_fixed
    return nyc_poly,hr_poly

def get_job_counts():
    """
    Returns job counts for each transit walkshed using blocks and lodes data
        
    Returns
    ----------
    GeoDataFrame
        Transit walkshed file with job counts included
    """
    
    nyc_poly_fixed,hr_poly_fixed = get_transit_walksheds()
    nyc_lodes = pd.read_csv(NYC_LODES)
    hr_lodes = pd.read_csv(HR_LODES)
    nyc_blocks = gpd.read_file(NYC_BLOCKS)
    hr_blocks = gpd.read_file(HR_BLOCKS)
    
    print("Getting NYC jobs")
    nyc_jobs = count_jobs(blocks=nyc_blocks, polygons=nyc_poly_fixed, 
                          LODES=nyc_lodes, polygon_id_col='id', crs='epsg:4326')
    print("Getting Hampton Roads jobs")
    hr_jobs = count_jobs(blocks=hr_blocks, polygons=hr_poly_fixed, 
                         LODES=hr_lodes, polygon_id_col='id', crs='epsg:4326')

    nyc_jobs = nyc_poly_fixed.merge(nyc_jobs,how='inner',on='id')
    hr_jobs = hr_poly_fixed.merge(hr_jobs,how='inner',on='id')
    
    nyc_jobs['jobs_cat'] = pd.qcut(nyc_jobs['jobs'], 3, labels=False, duplicates='drop')
    hr_jobs['jobs_cat'] = pd.qcut(hr_jobs['jobs'], 3, labels=False, duplicates='drop')
    
    jobs = pd.concat([nyc_jobs,hr_jobs])
    
    return jobs[['stop_id','jobs','jobs_cat']]

def add_jobs_feature(stops):
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
    jobs = get_job_counts()
    stops = stops.merge(jobs, how='inner', on='stop_id')
    
    return stops


def get_svi():
    
    nyc_poly_fixed,hr_poly_fixed = get_transit_walksheds()
    nyc_lodes = pd.read_csv(NYC_LODES)
    hr_lodes = pd.read_csv(HR_LODES)
    nyc_tracts = gpd.read_file(NYC_TRACTS)
    hr_tracts = gpd.read_file(HR_TRACTS)
    svi = pd.read_csv(SVI_PATH)

    print("Getting NYC SVI")
    nyc_svi = get_worker_svi(lodes=nyc_lodes, svi=svi, census_geo=nyc_tracts, polygons=nyc_poly_fixed, polygon_id_col='id', crs='epsg:4326')
    print("Getting Hampton Roads SVI")
    hr_svi = get_worker_svi(lodes=hr_lodes, svi=svi, census_geo=hr_tracts, polygons=hr_poly_fixed, polygon_id_col='id', crs='epsg:4326')
    
    nyc_svi = nyc_poly_fixed.merge(nyc_svi,how='inner',on='id')
    hr_svi = hr_poly_fixed.merge(hr_svi,how='inner',on='id')
    
    nyc_svi['worker_vulnerability_cat'] = pd.qcut(nyc_svi['SVI_total'], 3, labels=False, duplicates='drop')
    hr_svi['worker_vulnerability_cat'] = pd.qcut(hr_svi['SVI_total'], 3, labels=False, duplicates='drop')
    
    vulnerable_workers = pd.concat([nyc_svi,hr_svi])
    
    return vulnerable_workers[['stop_id','SVI_total', 'SVI_SES', 'SVI_household', 'SVI_race','SVI_housing_transport','worker_vulnerability_cat']]


def add_vulnerable_workers_feature(stops):
    
    vulnerable_workers = get_svi()
    stops = stops.merge(vulnerable_workers, how='inner', on='stop_id')
    
    return stops


def get_stops_features():
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

    stops = process_feeds()
    print("Adding First St. flood risk")
    stops = add_fs_flood_risk(stops)
    print("Adding NRI Coastal Flooding risk")
    stops = add_NRI_flood_risk(stops)
    print("Adding Hospital Access")
    stops = add_hospital_access(stops)
    print("Adding Number of jobs")
    stops = add_jobs_feature(stops)
    print("Adding Worker vulnerability")
    stops = add_vulnerable_workers_feature(stops)
    print("Added all features")
    
    return stops

def main():
    parser = argparse.ArgumentParser("Create stop features")
    parser.add_argument("--out",  required=True)
    
    opts = parser.parse_args()
    stop_features = get_stops_features()
    
    print(f"Writing feature file to {opts.out}")
    stop_features.to_file(opts.out)
    
if __name__ == "__main__":
    main()
