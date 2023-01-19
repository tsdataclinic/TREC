#!/bin/bash

## Points of Interest from GNIS

wget -O /home/data/points_of_interest/NationalFile.zip https://geonames.usgs.gov/docs/stategaz/NationalFile.zip
unzip /home/data/points_of_interest/NationalFile.zip  -d /home/data/points_of_interest/