import * as React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

function ModalLink(props: {
  children: string;
  modalContents: React.ReactNode;
}) {
  const { children, modalContents } = props;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Button
        unstyled
        className="hover:bg-slate-600 m-4"
        onClick={() => setIsModalOpen(true)}
      >
        {children}
      </Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onDismiss={() => setIsModalOpen(false)}
          title={children}
          onDissmissText='Close'
          isCentered={true}
        >
          {modalContents}
        </Modal>
      )}
    </>
  );
}

function ButtonLink(props: {
   children: string;
   url: string;
}) {
   const { children, url } = props;

   return (
      <Button
          unstyled
          className="hover:bg-slate-600 m-4"
          onClick={(e) => {
	    e.preventDefault();
	    window.location.href=url;
	   }}>
         {children}
      </Button>
   )
}

function LegalContents() {
  return (
    <>
      <p>
        TREC is hosted by Two Sigma Investments, LP, and is subject to Two
        Sigma's{' '}
        <a
          href="https://www.twosigma.com/legal-disclosure/"
          target="_blank"
          rel="noreferrer"
        >
          Legal Disclosure
        </a>{' '}
        and{' '}
        <a
          href="https://www.twosigma.com/legal-disclosure/privacy-policy/"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        , with the following amendments:
      </p>
      <p>
        The limited nonexclusive license for this website is for noncommercial
        purposes, and is provided for informational purposes.
      </p>
      <p>
        Note that the dashboard relies upon publicly available data from
        multiple sources that do not always agree. As set forth in the above
        referenced Legal Disclosure, Two Sigma disclaims any and all
        representations and warranties with respect to the website, including
        accuracy, fitness for use, reliability, and non-infringement.
      </p>
      <p>
        This tool is shared pursuant to the{' '}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0.html"
          target="_blank"
          rel="noreferrer"
        >
          Apache 2.0 License
        </a>
        . Licenses for the data contained herein can be found in the{' '}
        <a
          href="https://github.com/tsdataclinic/trec"
          target="_blank"
          rel="noreferrer"
        >
          TREC Github repo
        </a>
      </p>
    </>
  );
}

function MethodologyModalContents() {
  return (
    <>
      <p>
        All data other than floodplain polygons were processed into a stop level
        file. We describe the methods we used to create this file below.
      </p>
      <ul>
        <li>
          Stops: The GTFS feed data (refer Data Sources) was processed into a
          file containing the stop IDs, transit type (e.g. bus, light rail),
          name, the list of routes servicing the stop, and a latitude/longitude
          point geometry.
        </li>
        <li>
          Flood risk: First Street Foundation's aggregated flood risk data
          categorizes census tracts according to the number of buildings at
          minor, moderate, major, severe, and extreme flood risk. Transit stops
          inside tracts where no buildings were above minor risk were labeled
          'low' risk, stops inside tracts with under 15% of buildings above
          minor risk were labeled 'medium' risk, and stops inside tracts with
          more than 15% of buildings above minor risk were labeled as 'high'
          risk.
        </li>
        <li>
          Hospital Access: We calculated 10 and 20 minute walk sheds (using walk
          graphs from OSM and assumptions on average walking pace ) centered on
          each hospital in the GNIS Database and intersected these polygons with
          the transit stop points. We considered stops within a 10 minute
          walking distance as providing high access and between 10-20 minutes as
          providing medium access. All stops not within a walkshed were
          categorized as providing low access to hospitals.
        </li>
        <li>
          Jobs: The Census LODES dataset contains origin-destination employment
          statistics for all workers within each state which we use to derive
          the total number of people working in each block. To estimate the
          total number of workers within walking distance from each transit
          stop, we first create 15 minute walk sheds (using walk graphs from OSM
          ) around each stop. These polygons do not conform with the census
          block boundaries, so we use areal interpolation to estimate the jobs
          within each walkshed. The final count is computed by subtracting the
          number of people who both live and work in each walkshed from this
          total to exclude workers who are unlikely to rely on transit to get to
          their jobs. The high/medium/low categories correspond to the first,
          second, and third tertiles of these counts.
        </li>
        <li>
          Vulnerable workers: We used a similar method to estimate the
          vulnerability of workers in the area of a transit stop. Instead of
          aggregating the LODES data to the census block, we matched the
          origin-destination blocks to their corresponding census tracts, and
          linked the origin tracts to the SVI dataset . We again used an areal
          interpolation process to estimate the vulnerability of workers working
          within the 15 minute stop walksheds based on the census tract in which
          they live. As with the jobs, we divided the stops into high/medium/low
          using tertiles.
        </li>
      </ul>

      <h3>Data Sources</h3>
      <ul>
        <li>
          Census tract, block geographies retrieved using{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://walker-data.com/tidycensus"
          >
            TidyCensus
          </a>{' '}
          with data by{' '}
          <a target="_blank" rel="noreferrer" href="https://www.census.gov/">
            US Census Bureau
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://ask.census.gov/prweb/PRServletCustom/app/ECORRAsk2/YACFBFye-rFIz_FoGtyvDRUGg1Uzu5Mn*/!STANDARD?pzuiactionzzz=CXtpbn0rTEpMcGRYOG1vS0tqTFAwaENUZWpvM1NNWEMzZ3p5aFpnWUxzVmw0TjJpQS85RkNvUXZDRVRQWWtWSDFQaWZj*"
          >
            Public Domain
          </a>
          .
        </li>
        <li>
          Flood risk data from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://aws.amazon.com/marketplace/pp/prodview-r36lzzzjacd32?sr=0-1&ref_=beagle&applicationId=AWSMPContessa#overview"
          >
            First Street Climate-Adjusted Flood Risk - US Aggregate Data by
            First Street Foundation
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          >
            CC BY-NC-SA 4.0
          </a>
        </li>
        <li>
          <a target="_blank" rel="noreferrer" href="https://www.census.gov/">
            U.S. Census Bureau
          </a>{' '}
          (2023).{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://lehd.ces.census.gov/data/"
          >
            LEHD Origin-Destination Employment Statistics Data
          </a>{' '}
          (2002-2019) [computer file]. Washington, DC: U.S. Census Bureau,
          Longitudinal-Employer Household Dynamics Program [distributor],
          accessed on 01-26-2023 at https://lehd.ces.census.gov/data/#lodes.
          LODES 7.5
        </li>
        <li>
          Social vulnerability data from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html"
          >
            CDC/ATSDR Social Vulnerability Index 2020 Database US
          </a>{' '}
          by{' '}
          <a target="_blank" rel="noreferrer" href="https://www.atsdr.cdc.gov/">
            Centers for Disease Control and Prevention Agency for Toxic
            Substances and Disease Registry
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://data.cdc.gov/Health-Statistics/CDC-Social-Vulnerability-Index-SVI-/u6k2-rtt3/data"
          >
            Public Domain
          </a>
          .
        </li>
        <li>
          Street networks retrieved using{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/gboeing/osmnx"
          >
            OSMnx
          </a>{' '}
          with data by{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.openstreetmap.org/about"
          >
            Open Street Map
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://opendatacommons.org/licenses/odbl/"
          >
            Open Database License, "ODbL" 1.0
          </a>
        </li>
        <li>
          Hospital location data from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.usgs.gov/u.s.-board-on-geographic-names/download-gnis-data"
          >
            Geographic Names Information System National File 2021
          </a>
          ,{' '}
          <a target="_blank" rel="noreferrer" href="https://www.usgs.gov/">
            United States Geological Survey
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits"
          >
            Public Domain
          </a>
        </li>
        <li>
          New York City transit stops data was downloaded from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://new.mta.info/developers"
          >
            MTA Developer Resources
          </a>
          ,{' '}
          <a target="_blank" rel="noreferrer" href="https://new.mta.info/">
            New York City Metropolitan Transportation Authority
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="http://web.mta.info/developers/developer-data-terms.html#data"
          >
            Terms of Use
          </a>
        </li>
        <li>
          Hampton Roads transit stops from{' '}
          <a target="_blank" rel="noreferrer" href="https://gtfs.gohrt.com/">
            Hampton Roads Transit
          </a>
          ,{' '}
          <a target="_blank" rel="noreferrer" href="https://gohrt.com/">
            Hampton Roads Transit
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://gtfs.gohrt.com/terms.php"
          >
            Terms of Use
          </a>
        </li>
        <li>
          Williamsburg transit stops from retrieved from{' '}
          <a target="_blank" rel="noreferrer" href="http://www.gowata.org/">
            Williamsburg Area Transit Authority
          </a>
        </li>
        <li>
          New York City stormwater flood map data was downloaded from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://experience.arcgis.com/experience/6f4cc60710dc433585790cd2b4b5dd0e"
          >
            New York City Stormwater Flood Maps
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.nyc.gov/site/dep/index.page"
          >
            NYC Department of Environmental Protection
          </a>
          ,{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.nyc.gov/home/terms-of-use.page"
          >
            Terms of Use
          </a>
        </li>
        <li>
          Hampton Roads sea-level rise planning scenarios from{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.hrgeo.org/search?q=SLR"
          >
            Hampton Roads Geographic Exchange Online
          </a>
          ,{' '}
          <a target="_blank" rel="noreferrer" href="https://www.hrpdcva.gov/">
            Hampton Roads Planning District Commission
          </a>
        </li>
      </ul>
    </>
  );
}

function Header(props: { isMobile: boolean; }) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = React.useState(false);
  function handleToggleMenu() {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  }

  React.useEffect(() => {
    if (!props.isMobile) {
      setIsDropdownMenuOpen(false)
    }
  }, [props.isMobile])
  return (
    <header className="h-16 px-4 flex justify-between items-center top-0 z-10 bg-app-slate text-white">
      {
        isDropdownMenuOpen ?
        <div>
          <ButtonLink url="/about">About</ButtonLink>
          <ModalLink modalContents={<LegalContents />}>Legal</ModalLink>
        </div>
        :
        <div className="flex space-x-4 items-center">
          <button onClick={() => window.location.href = "/"} className="flex">
            <img width="40px" alt="two-sigma-data-clinic-logo" src="/logo.png" />
            <h1 className="text-lg">TREC</h1>
          </button>
        </div>
      }
      <div className="flex">
        <div className='hidden sm:block'>
          <ButtonLink url="/about">About</ButtonLink>
          <ModalLink modalContents={<LegalContents />}>Legal</ModalLink>
        </div>
        <div className='block sm:hidden'>
          <button onClick={handleToggleMenu}>
            {isDropdownMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
