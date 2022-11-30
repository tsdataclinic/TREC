import pandas as pd
import geopandas as geopd
import argparse

EVENT_TYPES = ["CFLD"]
NRI_MEASURES = ["AFREQ", "EALB"]

def process_NRI(NRI_data_path):
    """
    Takes raw NRI data file and outputs trimmed version with GEOID column and metrics (e.g. total expected building damage) for event types (e.g. coastal flooding) specified as globable variables
     
    Parameters
    ----------
    NRI_data: DataFrame
        Raw NRI data from NRI website
    Returns
    ----------
    DataFrame
        NRI data for specified event types and measures. GEOID column for easy merge to census values
    """
    
    NRI_data = pd.read_csv(NRI_data_path)
    
    NRI_data["GEOID"] = NRI_data["NRI_ID"].str.slice(1,12) # NRI ID is GEOID with a letter in front, extracting last 11 digits gives tract-level GEOID
    category_columns = [col for col in NRI_data.columns if col[0:4] in EVENT_TYPES and col[5:len(col)] in NRI_MEASURES]
    base_columns = ["GEOID", "BUILDVALUE"]
    
    return NRI_data[base_columns + category_columns].reset_index(drop = True)

def main():
    parser = argparse.ArgumentParser("NRI Tract Merge")
    parser.add_argument("--NRI_data_path", required=True)
    parser.add_argument("--output_path", required=True)
    
    opts = parser.parse_args()
    NRI_data_path = opts.NRI_data_path
    output_path = opts.output_path
    
    out = process_NRI(NRI_data_path)
    out.to_csv(output_path)
    print("NRI data processed and written to: " + output_path) 

    
if __name__ == "__main__":
    main()
    
# python3 -m analysis.src.features.process_NRI --NRI_data_path "/home/data/national_risk_index/NRI_Table_CensusTracts.csv" --output_path "/home/data/results/climate_risk/NRI_processed.csv"
