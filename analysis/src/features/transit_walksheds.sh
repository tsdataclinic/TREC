#!/bin/bash

python3 features/walk_shed.py --points='/home/data/results/stop_features/all_nyc_stops.geojson' --graph='/home/data/osm/nyc/NYC_walk_graph.gpickle' --out='/home/data/osm/nyc/walksheds/transit_walkshed.geojson' --time=15 --combine=False

python3 features/walk_shed.py --points='/home/data/results/stop_features/all_hr_stops.geojson' --graph='/home/data/osm/hampton_roads/HR_walk_graph.gpickle' --out='/home/data/osm/hampton_roads/walksheds/transit_walkshed.geojson' --time=15 --combine=False

python3 features/build_stop_features.py --out='/home/data/results/stop_features.geojson'

aws s3 cp /home/data/results/stop_features.geojson s3://top-sprint/results/stop_features.geojson