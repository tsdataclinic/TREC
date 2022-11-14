#!/bin/bash

## Hampton Roads Transit Feed data

wget -O ~/../data/national_risk_index/NRI_Table_CensusTracts.zip https://hazards.fema.gov/nri/Content/StaticDocuments/DataDownload//NRI_Table_CensusTracts/NRI_Table_CensusTracts.zip
unzip ~/../data/national_risk_index/NRI_Table_CensusTracts.zip -d ~/../data/national_risk_index/