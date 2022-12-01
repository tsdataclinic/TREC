import pandas as pd
import geopandas as gpd
import networkx as nx
import osmnx as ox
from shapely.geometry import Point, LineString, Polygon, MultiLineString
import sys
from src.data.process_stops import process_feeds
from src.data.process_fsf import process_fsf
from src.features.count_jobs import count_jobs

WALKSHED_PATH = '/home/data/osm/'
CITY_DIRS = ['nyc','hampton_roads']

def fix_walkshed(graph, polygons):
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
    fsf_feature = process_fsf()
    
    stops = stops.merge(fsf_feature[['GEOID','risk_score','risk_category']],how='left',
                        left_on = "GEOID_2020", right_on = "GEOID")
    
    return stops


def load_NRI_data(NRI_data_path='/home/data/results/climate_risk/NRI_processed.csv'): 
    NRI_data = pd.read_csv(NRI_data_path)
    NRI_data["GEOID"] = NRI_data["GEOID"].astype(str).str.zfill(11)
    
    NRI_data['CFLD_AFREQ'] = NRI_data['CFLD_AFREQ'].fillna(0)
    NRI_data['CFLD_EALB'] = NRI_data['CFLD_EALB'].fillna(0)
    
    return NRI_data[['GEOID','CFLD_AFREQ','CFLD_EALB']]


def add_NRI_flood_risk(stops):
    NRI_data = load_NRI_data()
    stops = stops.merge(NRI_data, how='left', left_on = "GEOID_2010", right_on = "GEOID")
    stops['CFLD_damage_quantile'] = pd.qcut(stops['CFLD_EALB'], 3, labels=False, duplicates='drop')
    stops['CFLD_freq_quantile'] = pd.qcut(stops['CFLD_AFREQ'], 3, labels=False, duplicates='drop')
    
    return stops


def get_hospital_walkshed(base_path=WALKSHED_PATH, cities=CITY_DIRS):
    
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
    high, med = get_hospital_walkshed()
    high_idx = gpd.sjoin(stops, high, predicate='within').index
    med_idx = gpd.sjoin(stops, med, predicate='within').index
    
    stops['access_to_hospital'] = 'Low'
    stops.loc[stops.index.isin(med_idx),'access_to_hospital'] = 'Medium'
    stops.loc[stops.index.isin(high_idx),'access_to_hospital'] = 'High'
    
    return stops


# Add job info
def get_transit_walksheds():
        
    nyc_poly = gpd.read_file('/home/data/osm/nyc/walksheds/transit_walkshed.geojson')
    hr_poly = gpd.read_file('/home/data/osm/hampton_roads/walksheds/transit_walkshed.geojson')
        
    nyc_poly = nyc_poly.reset_index().rename(columns={'index':'id'})
    hr_poly = hr_poly.reset_index().rename(columns={'index':'id'})
    
    nyc_graph = nx.read_gpickle('/home/data/osm/nyc/NYC_walk_graph.gpickle')
    hr_graph = nx.read_gpickle('/home/data/osm/hampton_roads/HR_walk_graph.gpickle')
    
    nyc_poly_fixed = fix_walkshed(nyc_graph, nyc_poly)
    hr_poly_fixed = fix_walkshed(hr_graph, hr_poly)
    
    return nyc_poly_fixed,hr_poly_fixed

def get_job_counts():
    
    nyc_poly_fixed,hr_poly_fixed = get_transit_walksheds()
    nyc_lodes = pd.read_csv('/home/data/census/nyc/LODES/ny_od_main_JT01_2019.csv')
    hr_lodes = pd.read_csv('/home/data/census/hampton_roads/LODES/va_od_main_JT01_2019.csv')
    nyc_blocks = gpd.read_file('/home/data/census/nyc/geo/blocks.geojson')
    hr_blocks = gpd.read_file('/home/data/census/hampton_roads/geo/blocks.geojson')
    
    nyc_jobs = count_jobs(blocks=nyc_blocks, polygons=nyc_poly_fixed, 
                          LODES=nyc_lodes, polygon_id_col='id', crs='epsg:4326')
    hr_jobs = count_jobs(blocks=hr_blocks, polygons=hr_poly_fixed, 
                         LODES=hr_lodes, polygon_id_col='id', crs='epsg:4326')

    nyc_jobs = nyc_poly_fixed.merge(nyc_jobs,how='inner',on='id')
    hr_jobs = hr_poly_fixed.merge(hr_jobs,how='inner',on='id')
    
    nyc_jobs['jobs_cat'] = pd.qcut(nyc_jobs['jobs'], 3, labels=False, duplicates='drop')
    hr_jobs['jobs_cat'] = pd.qcut(hr_jobs['jobs'], 3, labels=False, duplicates='drop')
    
    jobs = pd.concat([nyc_jobs,hr_jobs])
    
    return jobs[['stop_id','jobs','jobs_cat']]

def add_jobs_feature(stops):
    jobs = get_job_counts()
    stops = stops.merge(jobs, how='inner', on='stop_id')
    
    return stops


def get_stops_features():
    stops = process_feeds()
    stops = add_fs_flood_risk(stops)
    stops = add_NRI_flood_risk(stops)
    stops = add_hospital_access(stops)
    # stops = add_jobs_feature(stops)
    
    return stops
    
    