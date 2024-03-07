import React, { useState } from 'react';
import AccordionComponent from './ui/Accordion/Accordion';
import InfoPage from './InfoPage';

const MethodsPage = () => {
    const menuItems = ['Methodology', 'Climate Data', 'Transit Data', 'Geographic Data', 'Demographic Data'];
    const [activeSection, setActiveSection] = useState(menuItems[0]);
    return <InfoPage
        title="Methods"
        menuItems={menuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}>
        <section className={`${activeSection !== 'Methodology' && `hidden`}`} id="Methodology">
            <p className="mb-8">
                All data other than floodplain polygons were processed into a stop level file. We briefly describe the approaches we used to create this file below. A more in-depth review of our methodology can be found on <a href="https://github.com/tsdataclinic/TREC/tree/main/analysis">GitHub</a>.
            </p>
            <div className="grid gap-8 sm:grid-cols-2">
                <p>
                    <p><b>Climate Risk</b></p>
                    <a href="https://firststreet.org/">First Street Foundation’s</a> <a href="https://aws.amazon.com/marketplace/seller-profile?id=b777a8d0-ad41-4190-b94a-27e18e87e17f">Climate Risk Factor data</a> categorizes census tracts according to the number of buildings at minor, moderate, major, severe, and extreme climate risk. Transit stops inside tracts where no buildings were above minor risk are labeled ‘low’ risk, stops inside tracts with under 15% of buildings above minor risk are labeled  ‘medium’ risk, and stops inside tracts with more than 15% of buildings above minor risk are labeled as ‘high’ risk.
                    Flood and heat risks are bucketed relative to the local <a href="https://en.wikipedia.org/wiki/Metropolitan_statistical_area">Metro Area</a>, and Wildfire risk is bucketed nationally.
                </p>
                <p>
                    <p><b>Hospital Access</b></p>
                    We calculate walk sheds, using walk graphs from <a href="https://www.openstreetmap.org/about">OSM</a> and assumptions on average walking pace, centered on each hospital in the <a href="https://www.usgs.gov/u.s.-board-on-geographic-names/download-gnis-data">GNIS Database</a>. Stops within a 10 minute walk are categorized as high access, those between 10-20 minutes as medium access, and all others as low access.
                </p>
                <p>
                    <p><b>Jobs</b></p>
                    To estimate the total number of workers within walking distance from each transit stop, we first create 15 minute walk sheds (using walk graphs from <a href="https://www.openstreetmap.org/about">OSM</a>) around each stop, and apply areal interpolation to estimate the jobs within each walkshed using <a href="https://lehd.ces.census.gov/data/">LODES’</a> origin-destination employment statistics. The high/medium/low categories correspond to the first, second, and third tertiles of these counts relative to the <a href="https://en.wikipedia.org/wiki/Metropolitan_statistical_area">Metro Area</a>.
                </p>
                <p>
                    <p><b>Vulnerable workers</b></p>
                    Using <a href="https://lehd.ces.census.gov/data/">LODES</a>, we match the destination blocks to their corresponding census tracts, and link the origin tracts to the <a href="https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html">SVI dataset</a> to estimate the vulnerability of workers working within the 15 minute of a stop. The high/medium/low categories correspond to the first, second, and third tertiles of these counts relative to the <a href="https://en.wikipedia.org/wiki/Metropolitan_statistical_area">Metro Area</a>.
                </p>
                <p>
                    <p><b>Stops</b></p>
                    The GTFS feed data is processed into a file containing the stop IDs, transit type (e.g., bus, light rail), name, list of routes servicing the stop, and a latitude/longitude point geometry.
                </p>
            </div>
        </section> 
        <section className={`${activeSection !== 'Climate Data' && `hidden`}`} id="Climate Data">
            {/* <p className="text-2xl">Climate Data</p> */}
            <AccordionComponent title={'NATIONAL'}>
                <li>Flood Risk Factor data from <a href="https://aws.amazon.com/marketplace/pp/prodview-r36lzzzjacd32?sr=0-1&ref_=beagle&applicationId=AWSMPContessa#overview">First Street Climate-Adjusted Flood Risk - US Aggregate Data</a> by <a href="https://firststreet.org/">First Street Foundation, CC 4.0</a>.</li>
                <li>
                    Wildfire Risk Factor data from <a href="https://aws.amazon.com/marketplace/pp/prodview-crz65ioiwanoc?sr=0-3&ref_=beagle&applicationId=AWSMPContessa#overview">First Street Climate-Adjusted Heat Risk - US Aggregate Data</a> by <a href="https://firststreet.org/">First Street Foundation, CC 4.0</a>.
                </li>
                <li>
                    Heat Risk Factor data from <a href="https://aws.amazon.com/marketplace/pp/prodview-juylajmn3mixo?sr=0-2&ref_=beagle&applicationId=AWSMPContessa#overview">First Street Climate-Adjusted Wildfire Risk - US Aggregate Data</a> by <a href="https://firststreet.org/">First Street Foundation, CC 4.0</a>.
                </li>
                <li>
                    Floodplain data from the <a href="https://www.fema.gov/flood-maps/national-flood-hazard-layer">National Flood Hazard Layer</a> by <a href="https://www.fema.gov/">FEMA</a>.
                </li>
            </AccordionComponent>
        </section>
        <section className={`${activeSection !== 'Transit Data' && `hidden`}`} id="Transit Data">
            {/* <p className="text-2xl">Transit Data</p> */}
            <AccordionComponent title={'NORTHEAST'}>
                <li>Boston</li>
                <li>Bridgeport</li>
                <li>Buffalo</li>
                <li>Hartford</li>
                <li>New York</li>
                <li>Philadelphia</li>
                <li>Pittsburgh</li>
                <li>Providence</li>
                <li>Rochester</li>
                <li>Worcester</li>
            </AccordionComponent>
            <AccordionComponent title={'MIDWEST'}>
                <li>Chicago</li>
                <li>Cincinnati</li>
                <li>Cleveland</li>
                <li>Columbus</li>
                <li>Des Moines</li>
                <li>Detroit</li>
                <li>Indianapolis</li>
                <li>Kansas City</li>
                <li>Milwaukee</li>
                <li>Minneapolis</li>
                <li>Omaha</li>
                <li>St. Louis</li>
            </AccordionComponent>
            <AccordionComponent title={'SOUTH'}>
                <li>Atlanta</li>
                <li>Austin</li>
                <li>Baltimore</li>
                <li>Birmingham</li>
                <li>Charlotte</li>
                <li>Dallas</li>
                <li>Greenville</li>
                <li>Houston</li>
                <li>Jacksonville</li>
                <li>Little Rock</li>
                <li>Louisville</li>
                <li>Memphis</li>
                <li>Miami</li>
                <li>Nashville</li>
                <li>Oklahoma City</li>
                <li>Orlando</li>
                <li>Raleigh</li>
                <li>Richmond</li>
                <li>San Antonio</li>
                <li>Tampa</li>
                <li>Virginia Beach</li>
                <li>Washington, DC</li>
            </AccordionComponent>
            <AccordionComponent title={'WEST'}>
                <li>Albuquerque</li>
                <li>Denver</li>
                <li>Fresno</li>
                <li>Las Vegas</li>
                <li>Los Angeles</li>
                <li>Phoenix</li>
                <li>Portland</li>
                <li>Riverside</li>
                <li>Sacramento</li>
                <li>Salt Lake City</li>
                <li>San Diego</li>
                <li>San Jose</li>
                <li>San Francisco</li>
                <li>Seattle</li>
            </AccordionComponent>
        </section>
        <section className={`${activeSection !== 'Geographic Data' && `hidden`}`} id="Geographic Data">
            <ul className='list-disc'>
                <li>Census tract, block geographies retrieved using <a href="https://github.com/censusdis/censusdis">censusdis</a> with data by <a href="https://www.census.gov/">US Census Bureau</a>, <a href="https://ask.census.gov/prweb/PRServletCustom/app/ECORRAsk2_/YACFBFye-rFIz_FoGtyvDRUGg1Uzu5Mn*/!STANDARD?pzuiactionzzz=CXtpbn0rTEpMcGRYOG1vS0tqTFAwaENUZWpvM1NNWEMzZ3p5aFpnWUxzVmw0TjJpQS85RkNvUXZDRVRQWWtWSDFQaWZj*">Public Domain</a>.</li>
                <li>Street networks retrieved using <a href="https://github.com/gboeing/osmnx">OSMnx</a> with data by <a href="https://www.openstreetmap.org/about">OpenStreetMap</a>, <a href="http://www.opendatacommons.org/licenses/odbl/">Open Database License, "ODbL" 1.0.</a></li>
                <li>Hospital location data from <a href="https://www.usgs.gov/u.s.-board-on-geographic-names/download-gnis-data">Geographic Names Information System National File 2021</a>, <a href="https://www.usgs.gov/">United States Geological Survey</a>, <a href="https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits">Public Domain</a>.</li>
            </ul>
        </section>
        <section className={`${activeSection !== 'Demographic Data' && `hidden`}`} id="Demographic Data">
            <ul className="list-disc">
                <li><a href="https://www.census.gov/">U.S. Census Bureau</a>. (2023). <a href="https://lehd.ces.census.gov/data/">LEHD Origin-Destination Employment Statistics Data</a> (2002-2021) [computer file]. Washington, DC: U.S. Census Bureau, Longitudinal-Employer Household Dynamics Program [distributor], accessed on 02-16-2023 at https://lehd.ces.census.gov/data/#lodes. LODES 8..</li>
                <li>Social vulnerability data from <a href="https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html">CDC/ATSDR Social Vulnerability Index 2020 Database US</a> by <a href="https://www.atsdr.cdc.gov/">Centers for Disease Control and Prevention Agency for Toxic Substances and Disease Registry</a>, <a href="https://data.cdc.gov/Health-Statistics/CDC-Social-Vulnerability-Index-SVI-/u6k2-rtt3/data">Public Domain</a>.</li>
            </ul>
        </section>
    </InfoPage>
    
};
export default MethodsPage;