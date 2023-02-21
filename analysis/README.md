Data Analysis overview
==============================

## Methodology:
 

All data other than floodplain polygons were processed into a stop level file. We describe the methods we used to create this file below.
 

-Stops: The GTFS feed data (refer Data Sources) was processed into a file containing the stop IDs, transit type (e.g. bus, light rail), name, the list of routes servicing the stop, and a latitude/longitude point geometry. 

-Flood risk: First Street Foundation’s aggregated flood risk data categorizes census tracts according to the number of buildings at minor, moderate, major, severe, and extreme flood risk. Transit stops inside tracts where no buildings were above minor risk were labeled ‘low’ risk, stops inside tracts with under 15% of buildings above minor risk were labeled  ‘medium’ risk, and stops inside tracts with more than 15% of buildings above minor risk were labeled as ‘high’ risk.

-Hospital Access: We calculated 10 and 20 minute walk sheds (using walk graphs from OSM and assumptions on average walking pace) centered on each hospital in the GNIS Database and intersected these polygons with the transit stop points. We considered stops within a 10 minute walking distance as providing high access and between 10-20 minutes as providing medium access. All stops not within a walkshed were categorized as providing low access to hospitals.

-Jobs: The census LODES dataset contains origin-destination employment statistics for all workers within each state which we use to derive the total number of people working in each block. To estimate the total number of workers within walking distance from each transit stop, we first create 15 minute walk sheds (using walk graphs from OSM) around each stop. These polygons do not conform with the census block boundaries, so we use areal interpolation to estimate the jobs within each walkshed. The final count is computed by subtracting the number of people who both live and work in each walkshed from this total to exclude workers who are unlikely to rely on transit to get to their jobs. The high/medium/low categories correspond to the first, second, and third tertiles of these counts.

-Vulnerable workers: We used a similar method to estimate the vulnerability of workers in the area of a transit stop. Instead of aggregating the LODES data to the census block, we matched the origin-destination blocks to their corresponding census tracts, and linked the origin tracts to the SVI dataset. We again used an areal interpolation process to estimate the vulnerability of workers working within the 15 minute stop walksheds based on the census tract in which they live. As with the jobs, we divided the stops into high/medium/low using tertiles.


## Getting Started
- Set up R and python environment
- Explain config file

### Data pipeline
Get raw data
Process data
Generate Features

command to run pipeline

Project Organization
------------

Directory Structure:

    ├── LICENSE
    ├── README.md          <- The top-level README for developers using this project.
    ├── data
    │   ├── external       <- Data from third party sources.
    │   ├── interim        <- Intermediate data that has been transformed.
    │   ├── processed      <- The final, canonical data sets for modeling.
    │   └── raw            <- The original, immutable data dump.
    │
    ├── src                <- Source code for use in this project.
    │   ├── __init__.py    <- Makes src a Python module
    │   │
    │   ├── data           <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features       <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   └── visualization  <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py


--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
