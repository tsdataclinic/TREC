import React from 'react';
import AccordionComponent from './ui/Accordion/Accordion';
import InfoPage from './InfoPage';

const MethodsPage = () => {
    return <InfoPage title="Methodology" menuItems={['Methodology', 'Climate Data']}>
        <section id="Methodology">
            <div className="">
                <p>
                    All data other than floodplain polygons were processed into a
                    stop level file. We describe the methods we used to create this
                    file below.
                </p>
                <div className="grid sm:grid-cols-2">
                <p>
                    <p><b>Stops</b></p>
                    The GTFS feed data (refer Data Sources) was processed
                    into a file containing the stop IDs, transit type (e.g. bus,
                    light rail), name, the list of routes servicing the stop,
                    and a latitude/longitude point geometry.
                </p>
                <p>
                    <p><b>Flood Risk</b></p>
                    First Street Foundation's aggregated flood risk
                    data categorizes census tracts according to the number of
                    buildings at minor, moderate, major, severe, and extreme
                    flood risk. First Street Foundation's risk categories were 
                    quantized from 1-10, and an aggregated risk score calculated 
                    for each census tract. For a city, risk scores were cut
                    into tertiles and stops within these tracts categorized 
                    as High, Medium, and Low flood risk respectively. 
                    
                    Note: Flood risk at Transit stops within a city are relative
                    to other locations within that city. For example: While overall 
                    flood risk is higher in New Orleans compared to New York City, 
                    there are transit locations categorized a "Low" flood risk in New Orleans
                    as they have lower chance of flooding compared to other areas of New Orleans. 
                </p>
                <p>
                    <p><b>Hospital Access</b></p>
                    We calculated 10 and 20 minute walk sheds
                    (using walk graphs from OSM and assumptions on average
                    walking pace ) centered on each hospital in the GNIS
                    Database and intersected these polygons with the transit
                    stop points. We considered stops within a 10 minute walking
                    distance as providing high access and between 10-20 minutes
                    as providing medium access. All stops not within a walkshed
                    were categorized as providing low access to hospitals.
                </p>
                <p>
                    <p><b>Jobs</b></p>
                    The Census LODES dataset contains origin-destination
                    employment statistics for all workers within each state
                    which we use to derive the total number of people working in
                    each block. To estimate the total number of workers within
                    walking distance from each transit stop, we first create 15
                    minute walk sheds (using walk graphs from OSM ) around each
                    stop. These polygons do not conform with the census block
                    boundaries, so we use areal interpolation to estimate the
                    jobs within each walkshed. The final count is computed by
                    subtracting the number of people who both live and work in
                    each walkshed from this total to exclude workers who are
                    unlikely to rely on transit to get to their jobs. The
                    high/medium/low categories correspond to the first, second,
                    and third tertiles of these counts.
                </p>
                <p>
                    <p><b>Vulnerable workers</b></p>
                    We used a similar method to estimate the
                    vulnerability of workers in the area of a transit stop.
                    Instead of aggregating the LODES data to the census block,
                    we matched the origin-destination blocks to their
                    corresponding census tracts, and linked the origin tracts to
                    the SVI dataset . We again used an areal interpolation
                    process to estimate the vulnerability of workers working
                    within the 15 minute stop walksheds based on the census
                    tract in which they live. As with the jobs, we divided the
                    stops into high/medium/low using tertiles.
                </p>
                </div>
            </div>
        </section>
        <section id="Climate Data">
            <AccordionComponent title={'CITIES'}>
                <li>City: </li>
                <li>City: </li>
                <li>City: </li>
                <li>City: </li>
            </AccordionComponent>
        </section>
    </InfoPage>
    
};
export default MethodsPage;