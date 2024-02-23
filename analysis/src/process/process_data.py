import sys 
sys.path.append('../')
from process.process_stops import process_stops
from process.process_hospitals import process_hospitals
from process.process_walksheds import process_walksheds
from process.process_FEMA_floodmaps import process_fema
import json
import argparse

def process_data(config, msa_id):
    print("Processing Stops") 
    process_stops(config,msa_id,out=True)
    print("Processing Hospitals") 
    process_hospitals(config, msa_id,out=True)
    print("Processing Walksheds") 
    process_walksheds(config, msa_id)
    # print("Processing FEMA floodmaps")
    # process_fema(config, msa_id)
    

def main():
    parser = argparse.ArgumentParser("Process all data")
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
        process_data(config, msa_id)
    

if __name__ == "__main__":
    main()
