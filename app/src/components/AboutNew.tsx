import React from 'react';
// import AccordionComponent from './ui/Accordion/Accordion';
import InfoPage from './InfoPage';

const AboutPageNew = () => {
    return <InfoPage title={'About'} menuItems={['TREC', 'About Data Clinic']}>
        <div className="mb-36" id="TREC">
            <div>
                In the fall of 2022, Data Clinic took part in{' '}
                <a
                target="_blank"
                rel="noreferrer"
                href="https://opportunity.census.gov/"
                >
                The Opportunity Project
                </a>
                , a semi-annual sprint organized by the U.S. Census in partnership
                with federal agencies to demonstrate the value of open data, as part
                of the{' '}
                <a
                target="_blank"
                rel="noreferrer"
                href="https://opportunity.census.gov/sprints/"
                >
                Building Climate Change Resilience Through Public Transit
                </a>{' '}
                sprint sponsored by the U.S. Department of Transportation.
            </div>
            <div>
                Across our many conversations with transit officials, researchers,
                and community organizers from across the country about the
                climate-related challenges and opportunities transportation systems
                face, a recurring theme was the desire to enable a better
                understanding of climate's intersectional impact on both transit and
                communities.
            </div>
            <div>
                In other words, a flooded bus stop doesn't just mean that the bus
                and passengers can't access the stop, but it may also impede access
                to a hospital or community support, or to a large amount of
                essential jobs. How can we share that insight more effectively?
            </div>
            <div>
                In response, we built Transit Resilience for Essential Commuting
                (TREC), an open source tool that allows users to efficiently assess
                the climate risk for transit stations within the context of the
                access it provides to vital services and regions. Initially focused
                on flooding, the most prevalent climate event facing transit
                officials across the country, and access to hospital and jobs, TREC
                allows users to explore our open data-derived, station-specific risk
                and access ratings, and easily filter those with the highest climate
                risk and highest importance for access.
            </div>
            <div>
                Our hope is that this human-centered and geospatial approach to the
                intersectional impact of climate change on transit and communities
                will give transit planners a more holistic picture to inform their
                infrastructure improvement decision-making. Further, we hope that
                making localized climate resilience tools like this open source,
                user-friendly, and publicly available, will empower community
                organizations to advocate for their underserved constituents.
            </div>
            <div>
                The climate crisis we face requires collective intelligence and
                creative problem solving, and democratizing access to these kinds of
                tools will be crucial in making progress.
            </div>
        </div>

        <div className="mb-36" id="About Data Clinic">
            <div>
                Data Clinic is the data and tech-for-good arm of Two Sigma, a
                financial sciences company headquartered in NYC.
            </div>
            <div>
                Since Data Clinic was founded in 2014, we have provided pro bono
                data science and engineering support to mission-driven organizations
                around the world via close partnerships that pair Two Sigma’s talent
                and way of thinking with our partner’s rich content-area expertise.
            </div>
            <div>
                To scale the solutions and insights we have gathered over the years,
                and to contribute to the democratization of data, we also engage in
                the development of open source tooling and data products.
            </div>

            <div>
                To learn more visit{' '}
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://dataclinic.twosigma.com"
                >
                dataclinic.twosigma.com
                </a>{' '}
                and connect with us via{' '}
                <a href="mailto:dataclinic@twosigma.com">dataclinic@twosigma.com</a>
            </div>
        </div>
    </InfoPage>
};
export default AboutPageNew;