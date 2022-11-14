#!/bin/bash

## Points of Interest from GNIS

wget -O ~/../data/points_of_interest/NationalFile.zip https://geonames.usgs.gov/docs/stategaz/NationalFile.zip
unzip ~/../data/points_of_interest/NationalFile.zip  -d ~/../data/points_of_interest/