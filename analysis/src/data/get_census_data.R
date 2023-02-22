pacman::p_load(tidyverse, 
               tidycensus, 
               sf, 
               optparse,
               tidyjson, 
               jsonlite, 
               purrr)


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
base_path <- config$base_path
config <- map_dfr(config[city], as_tibble)
msa_code <- config[config$city_code==city,]$msa_code

path = paste0(base_path,"/cities/",city,"/census/geo/")
tract_path = "tracts.geojson"
tract_2010_path = "tracts_2010.geojson"
block_group_path = "block_groups.geojson"
# block_path = "geo/blocks.geojson"
# acs_path =  "acs/acs_wide.csv"
print(path)
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


st_write(tract_boundaries, paste0(path, tract_path),append=FALSE)

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


st_write(tract_boundaries, paste0(path, tract_2010_path),append=FALSE)

## Save 2020 Block groups
block_group_boundaries <- get_acs(geography = "block group", 
                                  state = selected_msa_states, 
                                  year = 2019, 
                                  cb = TRUE, 
                                  geometry = T,
                                  variables = "B19013_001") %>% 
  mutate(county = substr(GEOID, 1,5)) %>%
  filter(county %in% selected_msa_counties) %>%
  select(-variable, -estimate, -moe)

block_group_boundaries <- st_transform(block_group_boundaries, "WGS84")

st_write(block_group_boundaries, paste0(path, block_group_path),append=FALSE)


