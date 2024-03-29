Data Analysis overview
==============================


## Getting Started

### Set up R and python environment

We are using R to gather the census geographies using the `tidycensus` library. All the packages needed for this are manged using the `pacman` library. To set-up the R environment, install R and use:
```R
install.packages("pacman")
```

The python environment for this can be built using [`pipenv`](https://pipenv.pypa.io/en/latest/)

If you already have Python and pip, you can easily install Pipenv into your home directory:

```bash
pip install --user pipenv
```

Install the libraries needed for this project and start the virtual environment by running 

```bash
pipenv install
pipenv shell
```

## Data Pipeline

### Config
Our data pipeline uses a config file to make it easy to adapt our app to other cities and get the pipeline running locally on your own machine. This config file, `src/config.json`, is currently set up such that the data pipeline will retrieve, process, and featurize the needed datasets for New York City and Hampton Roads, Virginia. The config file contains:
- `base_path`: field defining the folder in which the data files will be stored 
- `national`: feild with url or paths pointing to three national level data sources that will not change across different cities, and 
- city fields (i.e. `nyc` and `hr`) that have neccessary information about the cities whose data will be downloaded. Particularly, the city fields contain the following: 
  - the name of each city 
  - a key for each city 
  - the code for the city's Metropolitan Statistical Area (MSA)
  - the two letter abbreviation of the city's state and 
  - list of urls to the desired GTFS feeds in that city


### Running the pipeline

Our data processing pipeline proceeds in three steps, each with a corresponding python script.

1. Get raw data (`data/get_raw_data.py`) - For the specified city, downloads Census geographies, state-level LODES data, national point-of-interest data, the OSM street network, and the GTFS feed files.
**__NOTE__:** A few of the required datasets lack a direct download link and need to be added manually to the file structure after this step is run. The  [First Street Climate-Adjusted Flood Risk](https://aws.amazon.com/marketplace/pp/prodview-r36lzzzjacd32?sr=0-1&ref_=beagle&applicationId=AWSMPContessa#overview) and the [CDC/ATSDR Social Vulnerability Index](https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html) should be placed in the `/national` directory created by the get_raw_data script.
2. Process data (`process/process_data.py`) - Processes GTFS feed files into a single stops file and calculates 15-minute walksheds around each stop. Also calculates 10 and 20 minute walksheds around each hospital within the selected city.
3. Generate features (`features/build_stop_features.py`) - Uses raw and processed data sources to caclulate flood risk, hospital access, job access, and worker vulnerability. Outputs the resulting stop-level file.

These scripts are run on a per-city basis from the analysis folder. For instance, the data download script is run for New York City like this:

```bash
python3 -m  src/data/process_data --config src/config.json --city nyc
```

With the `config.json` file configured, the full pipeline can be run for all cities by running:

```bash
python3 src/run_pipeline.py --config src/config.json --city all
``` 

This script will sequntially run the pipeline for each city in the config file and concatenates the resulting stop-level files into a single multi-city geojson file (`stop_features.geojson`), along with a file containing the hospitals located in each city (`hospitals.geojson`) in the root directory defined in the config.

**__NOTE__:**
Some of the steps in the pipeline are computationally expensive. Particularly, creating the walkgraph for NYC from OSM data and calculating the number of jobs around each transit stop in NYC consumes a lot of memory and can be time intensive. 

## Feature Methodology

All data other than floodplain polygons and hospital locations were processed into a stop level file `stop_features.geojson`. We describe the methods we used to create this file below.
 

- Stops: The GTFS feed data (refer Data Sources) was processed into a file containing the stop IDs, transit type (e.g. bus, light rail), name, the list of routes servicing the stop, and a latitude/longitude point geometry. 

- Flood risk: First Street Foundation’s aggregated flood risk data categorizes census tracts according to the number of buildings at minor, moderate, major, severe, and extreme flood risk. First Street Foundation's risk categories were quantized from 1-10, and an aggregated risk score calculated for each census tract. For a city, risk scores were cut into tertiles and stops within these tracts categorized as High, Medium, and Low flood risk respectively. 

**Note**: Flood risk at Transit stops within a city are relative to other locations within that city. For example: While overall flood risk is higher in New Orleans compared to New York City, there are transit locations categorized a "Low" flood risk in New Orleans as they have lower chance of flooding compared to other areas of New Orleans. 

- Hospital Access: We calculated 10 and 20 minute walk sheds (using walk graphs from OSM and assumptions on average walking pace) centered on each hospital in the GNIS Database and intersected these polygons with the transit stop points. We considered stops within a 10 minute walking distance as providing high access and between 10-20 minutes as providing medium access. All stops not within a walkshed were categorized as providing low access to hospitals.

- Jobs: The Census LODES dataset contains origin-destination employment statistics for all workers within each state which we use to derive the total number of people working in each block. To estimate the total number of workers within walking distance from each transit stop, we first create 15 minute walk sheds (using walk graphs from OSM) around each stop. These polygons do not conform with the census block boundaries, so we use areal interpolation to estimate the jobs within each walkshed. The final count is computed by subtracting the number of people who both live and work in each walkshed from this total to exclude workers who are unlikely to rely on transit to get to their jobs. The high/medium/low categories correspond to the first, second, and third tertiles of these counts.

- Vulnerable workers: We used a similar method to estimate the vulnerability of workers in the area of a transit stop. Instead of aggregating the LODES data to the census block, we matched the origin-destination blocks to their corresponding census tracts, and linked the origin tracts to the SVI dataset. We again used an areal interpolation process to estimate the vulnerability of workers working within the 15 minute stop walksheds based on the census tract in which they live. As with the jobs, we divided the stops into high/medium/low using tertiles.

Project Organization
------------

Directory Structure:

    ├── README.md                       <- The top-level README for developers using this project.
    │
    ├── src                             <- Source code for use in this project
    │   ├── run_pipeline.py             <- Data pipeline script that calls functions from each step
    │   │
    │   ├── config.json                 <- Config file needed to run the pipeline
    │   │
    │   ├── data                        <- Scripts to download raw data sources
    │   │   ├── get_raw_data.py         <- Raw data download pipeline consisting of each of the below steps
    │   │   ├── get_POI_data.py         
    │   │   ├── get_transit_feeds.py    
    │   │   ├── get_census_data.R       
    │   │   ├── get_LODES.py            
    │   │   └── get_osm_data.py         
    │   │
    │   ├── process                     <- Scripts to perform processing operations on GTFS, hospital data, and walksheds
    │   │   ├── process_data.py         <- Processing pipeline consisting of each of the below steps
    │   │   ├── process_stops.py         
    │   │   ├── process_hospitals.py    
    │   │   ├── process_walksheds.py
    │   │   ├── process_FEMA_floodmaps.py
    │   │   └── process_fsf.py          <- Contains a function to process Flood Risk data from FSF
    │   │
    │   ├── features                    <- Scripts to turn raw and processed data into features for the web app
    │   │   ├── build_stop_features.py  <- Pipeline to add all features to the stops file
    │   │   ├── count_jobs.py           
    │   │   └── jobs_vulnerability.py   
    │   │
    │   └── utils                       <- Some geospatial helper functions used across the pipeline


--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
