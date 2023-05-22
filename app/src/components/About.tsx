import React from 'react';
import MediaQuery from 'react-responsive';


function FlexImage(props: {
   src: string;
   alt: string;
   query: string;
   style?: React.CSSProperties | undefined;
}) {
    const { src, alt, query, style } = props;
    return (
        <MediaQuery query={query}>
            <div className='flexColumn'>
	        <img src={src} alt={alt} style={style}/>
	    </div>
	</MediaQuery>
    )
}

const About = () => {
    return (
        <div style={{ textAlign: 'left' }}>
	        <div className='segment' style={{ backgroundColor: 'white', color: '#103470', display: 'flex' }}>
	            <div className='flexColumn'>
		        <h1 className='headings'>
					Transit Resilience for Essential Commuting
		        </h1>
		        <div className='body'>In the fall of 2022, Data Clinic took part in{' '}
                            <a target="_blank"
			       rel="noreferrer"
			       href="https://opportunity.census.gov/">
		            The Opportunity Project</a>
		            , a semi-annual sprint organized by the U.S. Census in partnership with
		            federal agencies to demonstrate the value of open data, as part of the{' '}
		            <a target="_blank"
			      rel="noreferrer"
			      href="https://opportunity.census.gov/sprints/">
		            Building Climate Change Resilience Through Public Transit</a>{' '}
	                    sprint sponsored by the U.S. Department of Transportation.
			</div>
                        <div className='body'>
		            Across our many conversations with transit officials, researchers, and
		            community organizers from across the country about the climate-related
		            challenges and opportunities transportation systems face, a recurring
		            theme was the desire to enable a better understanding of climate's
		            intersectional impact on both transit and communities.
			</div>
		        <div className='body'>
			    In other words, a flooded bus stop doesn't just mean that the bus and
			    passengers can't access the stop, but it may also impede access to a
			    hospital or community support, or to a large amount of essential jobs.
			    How can we share that insight more effectively?
	                </div>
					<div className='body'>
	                    In response, we built Transit Resilience for Essential Commuting (TREC),
	                    an open source tool that allows users to efficiently assess the climate
	                    risk for transit stations within the context of the access it provides
	                    to vital services and regions. Initially focused on flooding, the most
	                    prevalent climate event facing transit officials across the country, and
	                    access to hospital and jobs, TREC allows users to explore our open
	                    data-derived, station-specific risk and access ratings, and easily
	                    filter those with the highest climate risk and highest importance for
	                    access.
	                </div>
					<div className='body'>
			    Our hope is that this human-centered and geospatial approach to the
		            intersectional impact of climate change on transit and communities will
			    give transit planners a more holistic picture to inform their
		            infrastructure improvement decision-making. Further, we hope that making
			    localized climate resilience tools like this open source, user-friendly,
			    and publicly available, will empower community organizations to advocate
			    for their underserved constituents.
	                </div>
	                <div className='body'>
		            The climate crisis we face requires collective intelligence and creative
			    problem solving, and democratizing access to these kinds of tools will
		            be crucial in making progress.
                        </div>
				<div className='blockLink'>
				<a target="_blank"
				   rel="noreferrer"
				   href="https://github.com/tsdataclinic/trec">
					TREC Github repo
				</a>
	                    </div>
			<FlexImage src="" alt="" query="(max-width: 450px)"/>
                    </div>
		    <FlexImage src="" alt="" query="(min-width: 451px)"/>
	        </div>
                <div className='segment' style={{ backgroundColor: '#F0F5FF', color: '#103470', display: 'flex' }}>
		    <FlexImage src="" alt="" query="(min-width: 451px)"/>
	            <div className='flexColumn'>
                        <h2>
                            Methodology
                        </h2>

                       
			<FlexImage src="" alt="" query="(max-width: 450px)"/>
	            </div>
	        </div>
	        <div className='segment' style={{ backgroundColor: 'white', color: '#103470', display: 'flex' }}>
	            <div className='flexColumn'>
	                <h2>Data Sources</h2>
	                <div className='body'>
	                    <div className='blockLink'>
				<a target="_blank"
				   rel="noreferrer"
				   href="https://github.com/tsdataclinic/trec">
					TREC Github repo
				</a>
	                    </div>
	                </div>
			<FlexImage src="" alt="" query="(max-width: 450px)"/>
	            </div>
		    <FlexImage src="" alt="" query="(min-width: 451px)"/>
	        </div>
	        <div className='segment' style={{ backgroundColor: '#F0F5FF', color: '#103470', display: 'flex' }}>
		    <FlexImage src="https://miro.medium.com/max/3152/1*6g_929Nj-THV-1BYC0egZA.png" 
		               alt="Data Clinic"
			       query="(min-width: 451px)"
			       style={{ width: '300px', height: '300px', margin: 'auto' }}/>
	            <div className='flexColumn'>
			<h1 className='headings'>What is Data Clinic?</h1>
	                <div className='body'>
	                    Data Clinic is the data and tech-for-good arm of Two Sigma, a financial
	                    sciences company headquartered in NYC.
	                </div>
	                <div className='body'>
	                    Since Data Clinic was founded in 2014, we have provided pro bono data
	                    science and engineering support to mission-driven organizations around
	                    the world via close partnerships that pair Two Sigma’s talent and way of
	                    thinking with our partner’s rich content-area expertise.
	                </div>
	                <div className='body'>
		            To scale the solutions and insights we have gathered over the years, and
		            to contribute to the democratization of data, we also engage in the
		            development of open source tooling and data products.
	                </div>

                        <div className='body'>
				To learn more visit{' '}
				<a target="_blank"
				   rel="noreferrer"
				   href="https://dataclinic.twosigma.com">
		                        dataclinic.twosigma.com
				</a>{' '}
				and connect with us via{' '}
				<a href="mailto:dataclinic@twosigma.com">dataclinic@twosigma.com</a>
	                </div>
			<FlexImage src="https://miro.medium.com/max/3152/1*6g_929Nj-THV-1BYC0egZA.png"
                                   alt="Data Clinic"
                                   query="(max-width: 450px)"
                                   style={{ width: '300px', height: '300px', margin: 'auto' }}/>
	            </div>
                </div>
               <div className='segment' style={{ backgroundColor: 'white', color: '#103470', display: 'flex' }}>
	           <div className='flexColumn'>
                       <h1 className='headings'>How can I contribute?</h1>
	               <div className='body'>
		           We want TREC to support your needs. That means that we need a lot of
		           voices helping us shape the features we develop.
	               </div>
	               <div className='body'>
	                    If you would like to suggest a feature or improvement, please either{' '}
	                    <a target="_blank"
			       rel="noreferrer"
			       href="https://github.com/tsdataclinic/trec/issues">
			        open a ticket on GitHub
			    </a>{' '}
	                    or reach out to us by{' '}
	                    <a target="_blank"
			       rel="noreferrer"
			       href="mailto:dataclinic@twosigma.com">
			       email
			    </a>.
                       </div>
                       <div className='body'>
			   If you want to contribute in a technical capacity, head over to our{' '}
		           <a target="_blank"
			      rel="noreferrer"
			      href="https://github.com/tsdataclinic/trec">
			       GitHub page
			   </a>{' '}
			   to open issues, suggest features, contribute pull requests, and find
			   beginner issues.
		       </div>
		       <FlexImage src="" alt="" query="(max-width: 450px)"/>
		   </div>
		   <FlexImage src="" alt="" query="(min-width: 451px)"/>
               </div>
      </div>
   )
};

export default About;
