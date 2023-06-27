import pandas as pd
import geopandas as geopd
import os
import argparse
import json

def process_fsf(config):
   """
   Loads and processes First Street Foundation's Flood Risk scores. Creates
   - Aggregated risk scores for each tract
   - Risk category based on % of properties in each tract with moderate or higher risk scores
   
   Parameters
   ----------
   config: JSON
   
   Returns
   ----------
   DataFrame with the following features:
      - GEOID: 2020 Census Tract ID
      - pct_{}: % of properties with minor, moderate, major, severe, and extreme flooding risk
      - risk_score: Aggregate flood risk score ranging from 1-10
      - pct_moderate_plus: % of propoerties in tract with moderate or higher flooding risk
      - risk_category: pct_moderate_plus categorized into 3 bins
   """
   path = config["national"]["flood_risk_path"]
   
   fsf = pd.read_csv(path)

   fsf["GEOID"] = fsf["fips"].astype(str).str.zfill(11)
   fsf = fsf.drop("fips", axis = 1)
   
   fsf[['count_floodfactor1', 'count_floodfactor2',
      'count_floodfactor3', 'count_floodfactor4', 'count_floodfactor5',
      'count_floodfactor6', 'count_floodfactor7', 'count_floodfactor8',
      'count_floodfactor9', 'count_floodfactor10']] = fsf[['count_floodfactor1', 'count_floodfactor2',
      'count_floodfactor3', 'count_floodfactor4', 'count_floodfactor5',
      'count_floodfactor6', 'count_floodfactor7', 'count_floodfactor8',
      'count_floodfactor9', 'count_floodfactor10']].div(fsf.count_property, axis=0)
   
   fsf['pct_minor'] = fsf['count_floodfactor1'] + fsf['count_floodfactor2']
   fsf['pct_moderate'] = fsf['count_floodfactor3'] + fsf['count_floodfactor4']
   fsf['pct_major'] = fsf['count_floodfactor5'] + fsf['count_floodfactor6']
   fsf['pct_severe'] = fsf['count_floodfactor7'] + fsf['count_floodfactor8']
   fsf['pct_extreme'] = fsf['count_floodfactor9'] + fsf['count_floodfactor10']
   
   fsf_sum = fsf[['GEOID','count_floodfactor1', 'count_floodfactor2',
      'count_floodfactor3', 'count_floodfactor4', 'count_floodfactor5',
      'count_floodfactor6', 'count_floodfactor7', 'count_floodfactor8',
      'count_floodfactor9', 'count_floodfactor10']].copy(deep=True)
   
   fsf = fsf.drop(columns=['count_floodfactor1', 'count_floodfactor2',
      'count_floodfactor3', 'count_floodfactor4', 'count_floodfactor5',
      'count_floodfactor6', 'count_floodfactor7', 'count_floodfactor8',
      'count_floodfactor9', 'count_floodfactor10'])
   
   fsf_sum = pd.wide_to_long(fsf_sum, stubnames='count_floodfactor', i='GEOID', j='risk').reset_index()
   fsf_sum['risk_score'] = fsf_sum['risk']*fsf_sum['count_floodfactor']
   fsf_sum = fsf_sum.groupby('GEOID').sum().reset_index()
   
   fsf = fsf.merge(fsf_sum[['GEOID','risk_score']], how='left', on='GEOID')
   
   fsf["pct_moderate_plus"] = fsf["pct_moderate"] + fsf["pct_major"] + fsf["pct_severe"] + fsf["pct_extreme"]
   fsf["pct_moderate_plus"] = fsf["pct_moderate_plus"].fillna(0)
   fsf["risk_category"] = pd.qcut(fsf["pct_moderate_plus"], 3, labels=False, duplicates='drop')
   # fsf["risk_category"] = fsf.risk_category.cat.codes
   
   
   return fsf
