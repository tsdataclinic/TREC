library("tidyverse")
library("tidycensus")
library("sf")
library("optparse")
library("tidyjson")
library("jsonlite")


option_list = list(
    make_option(c("--config"), type="character", default=NULL, 
              help="configuration file", metavar="character"),
    make_option(c("--city"), type="character", default=NULL, 
              help="city code", metavar="character")    
); 
 
opt_parser = OptionParser(option_list=option_list);
opt = parse_args(opt_parser);

config <- fromJSON(txt=opt$config)
city <- opt$city

config <- config %>% spread_all()
msa_code <- config[config$city_code==city,]$msa_code

path = paste0(config$base_path,"/cities/",city,"/census/")
tract_path = "geo/tracts.geojson"
tract_2010_path = "geo/tracts_2010.geojson"
block_group_path = "geo/block_groups.geojson"
block_path = "geo/blocks.geojson"
acs_path =  "acs/acs_wide.csv"

dir.create(path)

all_msa <- read_csv("https://www.bls.gov/cew/classifications/areas/qcew-county-msa-csa-crosswalk-csv.csv") # National MSA to county crosswalk
selected_msa <- all_msa %>% filter(`MSA Code` == msa_code)
selected_msa_counties <- selected_msa %>% pull(`County Code`)
selected_msa_states <- selected_msa %>% separate(`County Title`, sep = ",", into = c("name", "state")) %>%  pull(state) %>% unique()

## Save 2020 Tract boundaries
tract_boundaries <- get_acs(geography = "tract",
                            state = selected_msa_states,
                            year = 2020, 
                            cb = TRUE, 
                            geometry = T, 
                            variables = "B19013_001") %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) %>%
  select(-variable, -estimate, -moe)

tract_boundaries <- st_transform(tract_boundaries, "WGS84")


st_write(tract_boundaries, paste0(path, tract_path))

## Save 2010 Tract boundaries
tract_boundaries <- get_acs(geography = "tract",
                            state = selected_msa_states,
                            year = 2010, 
                            cb = TRUE, 
                            geometry = T, 
                            variables = "B19013_001") %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) %>%
  select(-variable, -estimate, -moe)

tract_boundaries <- st_transform(tract_boundaries, "WGS84")


st_write(tract_boundaries, paste0(path, tract_2010_path))

## Save 2020 Block groups
block_group_boundaries <- get_acs(geography = "block group", 
                                  state = selected_msa_states, 
                                  year = 2020, 
                                  cb = TRUE, 
                                  geometry = T,
                                  variables = "B19013_001") %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) %>%
  select(-variable, -estimate, -moe)

block_group_boundaries <- st_transform(block_group_boundaries, "WGS84")

st_write(block_group_boundaries, paste0(path, block_group_path))


## Save 2010 Block boundaries
block_boundaries <- get_decennial(geography = "block", 
                                  state = selected_msa_states, 
                                  year = 2010, 
                                  cb = TRUE, 
                                  geometry = T,
                                  variables = "H001001") %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) %>%
  select(-variable, -value)

block_boundaries <- st_transform(block_boundaries, "WGS84")

st_write(block_boundaries, paste0(path, block_path))


# Income/Employment Variables

income_employment_vars <- c(
  "total_pop" = "B01001_001",
  "pop_in_poverty" = "B17001_002"
  # Add more
)

# Age/Disability Variables

age_disability_vars <- c(
  "male_under_18" = "B05003_003",
  "female_under_18" = "B05003_014",
  "total_over_65" = "B16007_014"
  # Add more
)

# Minority/Language Variables

race_language_vars <- c(
  "white_nh_pop" = "B03002_003",
  "black_nh_pop" = "B03002_004",
  "asian_nh_pop" = "B03002_006",
  "hispanic_pop" = "B03002_012"
  # Add more
)

# Housing/Transportation Variables

housing_transport_vars <- c(
  "total_households" = "B08201_001",
  "households_no_car" = "B08201_002"
  # Add more
)

acs_vars <- c(income_employment_vars, age_disability_vars, race_language_vars, housing_transport_vars)

acs_long <- get_acs(geography = "tract",
                            state = selected_msa_states,
                            year = 2020, 
                            geometry = F, 
                            variables = acs_vars) %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) 

acs_wide <- acs_long %>%
  pivot_wider(id_cols = c(1,2), names_from = "variable", values_from = "estimate")

# Save ACS data

acs_wide <- acs_wide %>%
  mutate(total_under_18 = female_under_18 + male_under_18,
         )

write_csv(acs_wide, paste0(path, acs_path))
