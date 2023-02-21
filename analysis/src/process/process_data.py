import sys 
sys.path.append('../')
from src.process.process_stops import process_stops
from src.process.process_hospitals import process_hospitals
from src.process.process_walksheds import process_walksheds
import json
import argparse

def process_data(config, city_key):
    print("Processing Stops") 
    process_stops(config,city_key,out=True)
    print("Processing Hospitals") 
    process_hospitals(config, city_key,out=True)
    print("Processing Walksheds") 
    process_walksheds(config, city_key)


def main():
    parser = argparse.ArgumentParser("Process all data")
    parser.add_argument("--config", required=True)
    parser.add_argument("--city", required=True)
    opts = parser.parse_args()
    
    with open(opts.config) as f:
        config = json.load(f)

    process_data(config, opts.city)
    
    
if __name__ == "__main__":
    main()
