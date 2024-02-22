import pandas as pd
import geopandas as geopd
import os
import argparse
import json
from functools import reduce

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
      - pct_{}: % of properties with minor, moderate, major, severe, and extreme climate risk
      - risk_score: Aggregate climate risk score ranging from 1-10
      - pct_moderate_plus: % of propoerties in tract with moderate or higher climate risk
      - risk_category: pct_moderate_plus categorized into 3 bins
   """
   paths = config["national"]["fsf_climate_risk"]

   fsf_risk_dfs = []
   for risk in paths.keys():
      print(f"Processing {risk} risk")
      fsf = pd.read_csv(f"{config['base_path']}/national/{paths[risk]}")

      fsf["GEOID"] = fsf["fips"].astype(str).str.zfill(11)
      fsf = fsf.drop("fips", axis = 1)
      
      fsf[[f'count_{risk}factor1', f'count_{risk}factor2',
         f'count_{risk}factor3', f'count_{risk}factor4', f'count_{risk}factor5',
         f'count_{risk}factor6', f'count_{risk}factor7', f'count_{risk}factor8',
         f'count_{risk}factor9', f'count_{risk}factor10']] = fsf[[f'count_{risk}factor1', f'count_{risk}factor2',
         f'count_{risk}factor3', f'count_{risk}factor4', f'count_{risk}factor5',
         f'count_{risk}factor6', f'count_{risk}factor7', f'count_{risk}factor8',
         f'count_{risk}factor9', f'count_{risk}factor10']].div(fsf.count_property, axis=0)
      
      fsf[f'{risk}_pct_minor'] = fsf[f'count_{risk}factor1'] + fsf[f'count_{risk}factor2']
      fsf[f'{risk}_pct_moderate'] = fsf[f'count_{risk}factor3'] + fsf[f'count_{risk}factor4']
      fsf[f'{risk}_pct_major'] = fsf[f'count_{risk}factor5'] + fsf[f'count_{risk}factor6']
      fsf[f'{risk}_pct_severe'] = fsf[f'count_{risk}factor7'] + fsf[f'count_{risk}factor8']
      fsf[f'{risk}_pct_extreme'] = fsf[f'count_{risk}factor9'] + fsf[f'count_{risk}factor10']
      
      fsf_sum = fsf[['GEOID',f'count_{risk}factor1', f'count_{risk}factor2',
         f'count_{risk}factor3', f'count_{risk}factor4', f'count_{risk}factor5',
         f'count_{risk}factor6', f'count_{risk}factor7', f'count_{risk}factor8',
         f'count_{risk}factor9', f'count_{risk}factor10']].copy(deep=True)
      
      fsf = fsf.drop(columns=[f'count_{risk}factor1', f'count_{risk}factor2',
         f'count_{risk}factor3', f'count_{risk}factor4', f'count_{risk}factor5',
         f'count_{risk}factor6', f'count_{risk}factor7', f'count_{risk}factor8',
         f'count_{risk}factor9', f'count_{risk}factor10'])
      
      fsf_sum = pd.wide_to_long(fsf_sum, stubnames=f'count_{risk}factor', i='GEOID', j='risk').reset_index()
      fsf_sum[f'{risk}_risk_score'] = fsf_sum['risk']*fsf_sum[f'count_{risk}factor']
      fsf_sum = fsf_sum.groupby('GEOID').sum().reset_index()
      
      fsf = fsf.merge(fsf_sum[['GEOID',f'{risk}_risk_score']], how='left', on='GEOID')
      
      fsf[f"{risk}_pct_moderate_plus"] = fsf[f"{risk}_pct_moderate"] + fsf[f"{risk}_pct_major"] + fsf[f"{risk}_pct_severe"] + fsf[f"{risk}_pct_extreme"]
      fsf[f"{risk}_pct_moderate_plus"] = fsf[f"{risk}_pct_moderate_plus"].fillna(0)
      fsf[f"{risk}_risk_category_national"] = pd.qcut(fsf[f"{risk}_pct_moderate_plus"], 3, labels=False, duplicates='drop')
   # fsf["risk_category"] = fsf.risk_category.cat.codes
      fsf_risk_dfs.append(fsf)
   
   fsf_risk_features = reduce(lambda df1,df2: pd.merge(df1,df2,on='GEOID'), fsf_risk_dfs)
   return fsf_risk_features

if __name__ == "__main__":
   parser = argparse.ArgumentParser("Run fsf data processing")
   parser.add_argument("--config", required=True)
   opts = parser.parse_args()
    
   with open(opts.config) as f:
      config = json.load(f)
   process_fsf(config)
