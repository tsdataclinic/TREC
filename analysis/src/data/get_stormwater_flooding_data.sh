#!/bin/bash

# Get NYC Stormwater data

# Current Sea level
wget -O ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_current.zip https://data.cityofnewyork.us/download/7r5q-vr7p/application%2Fx-zip-compressed
unzip ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_current.zip -d ~/../data/nyc_stormwater_flood/

# 2050 Sea level
wget -O ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_2050.zip https://data.cityofnewyork.us/download/5rzh-cyqd/application%2Fx-zip-compressed
unzip ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_2050.zip -d ~/../data/nyc_stormwater_flood/

# 2080 Sea level
wget -O ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_2080.zip https://data.cityofnewyork.us/download/w8eg-8ha6/application%2Fx-zip-compressed
unzip ~/../data/nyc_stormwater_flood/nyc_stormwater_flood_2080.zip -d ~/../data/nyc_stormwater_flood/

## Removing spaces from file names
cd ~/../data/nyc_stormwater_flood/
for f in *; do mv "$f" "${f// /_}"; done
