import pandas as pd
import geopandas as geopd
import argparse

def load_FSF_data(FSF_data_path): 
    FSF_data = pd.read_csv(FSF_data_path)
    
    FSF_data["GEOID"] = FSF_data["fips"].astype(str).str.zfill(11)
    FSF_data = FSF_data.drop("fips", axis = 1)
    
    FSF_data["pct_moderate_plus"] = FSF_data["count_moderate"] + FSF_data["count_major"] + FSF_data["count_severe"] + FSF_data["count_extreme"]
    FSF_data["risk_category"] = pd.cut(FSF_data["pct_moderate_plus"], bins = [-1, 0, .15, 1], labels = ["Low", "Medium", "High"]).astype(str)
    print("Loading NRI data")
    return FSF_data

def load_NRI_data(NRI_data_path): 
    NRI_data = pd.read_csv(NRI_data_path)
    NRI_data["GEOID"] = NRI_data["GEOID"].astype(str).str.zfill(11)
    NRI_data = NRI_data.drop("Unnamed: 0", axis = 1)
    
    NRI_data['CFLD_AFREQ'] = NRI_data['CFLD_AFREQ'].fillna(0)
    NRI_data['CFLD_EALB'] = NRI_data['CFLD_EALB'].fillna(0)
    
    print("Loading FSF data")
    return NRI_data

def load_stops_data(stops_data_path):
    stops_data = geopd.read_file(stops_data_path)
    
    print("Loading stops data")
    return stops_data

def merge_stops_NRI_FSF(stops_data, NRI_data, FSF_data):
    merged = (stops_data
              .merge(NRI_data, how = "left", left_on = "GEOID_2010", right_on = "GEOID")
              .merge(FSF_data, how = "left", left_on = "GEOID_2020", right_on = "GEOID"))
    
    merged = merged.drop(["GEOID_x", "GEOID_y"], axis = 1)
    print("Merging FSF, NRI, stops data")
    return merged

def main():
    parser = argparse.ArgumentParser("Merge stops with FSF, NRI data")
    parser.add_argument("--NRI_data_path", required=True)
    parser.add_argument("--FSF_data_path", required=True)
    parser.add_argument("--stops_data_path", required=True)
    parser.add_argument("--output_path", required=True)
    
    opts = parser.parse_args()
    
    NRI_data_path = opts.NRI_data_path
    FSF_data_path = opts.FSF_data_path
    stops_data_path = opts.stops_data_path
    output_path = opts.output_path
    
    NRI_data = load_NRI_data(NRI_data_path)
    FSF_data = load_FSF_data(FSF_data_path)
    stops_data = load_stops_data(stops_data_path)
    
    out = merge_stops_NRI_FSF(stops_data, NRI_data, FSF_data)
    
    out.to_file(output_path)
    print("Stops data merged with NRI, FSF and written to: " + output_path) 

    
if __name__ == "__main__":
    main()

# python3 -m analysis.src.features.merge_stops_NRI_FSF --NRI_data_path "/home/data/results/climate_risk/NRI_processed.csv" --FSF_data_path "/home/data/results/climate_risk/fsf_flood_factor.csv" --stops_data_path "/home/data/results/GTFS_stops_processed.geojson" --output_path "/home/data/results/climate_risk/stops_NRI_FSF.geojson"