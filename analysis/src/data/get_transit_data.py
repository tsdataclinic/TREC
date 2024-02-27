from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO
import argparse
import json
import time
from utils.geo import create_extent
import requests
import pandas as pd


def get_feeds_in_msa(minx,miny,maxx,maxy,config):
    """
    For a given MSA, get Transit Land one-stop-ids.
    
    Parameters
    ----------
    msa_id: str
        MSA code

    """
    transit_land_api_key = config['transit_land_api_key']
    bbox = f'{minx},{miny},{maxx},{maxy}'
    url = f"https://transit.land/api/v2/rest/feeds/?api_key={transit_land_api_key}&bbox={bbox}&spec=gtfs"
    print(url)
    time.sleep(1)
    res = requests.get(url)
    response = res.json()
    # print(response.keys())

    if 'error' in response.keys():
        # print("split")
        l = maxx-minx
        w = maxy-miny
        fa = get_feeds_in_msa(minx, miny, maxx-l/2, maxy-w/2,config)
        fb = get_feeds_in_msa(minx+l/2, miny, maxx, maxy-w/2,config)
        fc = get_feeds_in_msa(minx, miny+w/2, maxx-l/2, maxy-w/2,config)
        fd = get_feeds_in_msa(minx+l/2, miny+w/2, maxx, maxy,config)
        feeds_df = pd.concat([fa,fb,fc,fd])
    else:
        feeds = response['feeds']
        
        if len(feeds) > 0:
            feeds_df = pd.DataFrame(feeds).drop(columns=['authorization', 'feed_state', 'feed_versions', 'languages','spec'])
            feeds_df = feeds_df[['id', 'name', 'onestop_id']]
            # feeds_df = pd.concat([feeds_df,feeds_df.license.apply(lambda x:pd.Series(x)),feeds_df.urls.apply(lambda x:pd.Series(x))],axis=1)
            # feeds_df = feeds_df[['id', 'name', 'onestop_id', 
            #    'attribution_instructions', 'attribution_text',
            #    'commercial_use_allowed', 'create_derived_product',
            #    'redistribution_allowed', 'share_alike_optional', 'spdx_identifier',
            #    'url', 'use_without_attribution', 'static_current']]
        else:
            feeds_df = pd.DataFrame(columns=['id', 'name', 'onestop_id'],index=range(1))
            # feeds_df = pd.DataFrame(columns=['id', 'name', 'onestop_id', 
            #    'attribution_instructions', 'attribution_text',
            #    'commercial_use_allowed', 'create_derived_product',
            #    'redistribution_allowed', 'share_alike_optional', 'spdx_identifier',
            #    'url', 'use_without_attribution', 'static_current'],index=range(1))
            # print(feeds_df)
    
    
    return feeds_df
    

def get_transit_feeds(config, msa_id):
    """
    Read feed URLs from config file, download, and unzip these to their respective folders.
    
    Parameters
    ----------
    config: JSON
        JSON configuration file

    """
    base_path = f"{config['base_path']}/cities/{msa_id}/transit_feeds/"
    geo_path = f"{config['base_path']}/cities/{msa_id}/census/geo/tracts.geojson"
    extent = create_extent(geo_path)
    bounds = extent.bounds.reset_index()
    print(bounds)
    feeds = get_feeds_in_msa(bounds.minx[0],bounds.miny[0],bounds.maxx[0],bounds.maxy[0], config)
    feeds = feeds.dropna(subset=['onestop_id'])
    feeds = feeds[~feeds.onestop_id.isin(['f-9-flixbus','f-megabus~us','f-dr-peterpanbuslines',
                                                  'f-9-amtrak~amtrakcalifornia~amtrakcharteredvehicle',
                                                  'f-d-groometransportation~us','f-dr-coachcompany~ma~us',
                                                  'f-f-viarail~traindecharlevoix','f-brightline~trails',
                                                  'f-drk-seastreak','f-dr5x-wwwnicebuscom','f-drk-wwwshorelineeastcom',
                                                  'f-academy~express~staten~island','f-fullington~trailways~ny',
                                                  'f-trailways~nyp~ny','f-trailways~adp~ny','f-adirondack~trailways~adu',
                                                  'f-adirondack~trailways~fab','f-catalina~express'
                                                  ])]
    feeds = feeds.drop_duplicates()
    
    for i,row in feeds.iterrows():
        feed_url = f"https://transit.land/api/v2/rest/feeds/{row.onestop_id}/download_latest_feed_version?api_key={config['transit_land_api_key']}"
        print(feed_url)
        with urlopen(feed_url) as zipresp:
            print("Downloading from: " + feed_url + " as " + row.onestop_id)
            with ZipFile(BytesIO(zipresp.read())) as zfile:
                zfile.extractall(base_path + row.onestop_id)


def main():
    parser = argparse.ArgumentParser("Get Transit Feed")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)

    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    get_transit_feeds(config, opts.city)
    
if __name__ == "__main__":
    main()
    