import { debug } from 'console';
import { GeoJsonProperties } from 'geojson';
import { MapboxGeoJSONFeature } from 'mapbox-gl';

import * as React from 'react';
import { getFilterGridColors } from './Filter';
import { PROPERTY_LABELS, SelectedRoute } from './MainPage';

function DataRow(props: {
  children: React.ReactNode;
  label: string;
}): JSX.Element {
  const { children, label } = props;
  return (
    <div className="w-full flex text-sm">
      <dt className="flex-1">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function DataRowLink(props: {
  city: string;
  route_type:string;
  routes_serviced:string;
  label: string;
  setDetailedRoutes: React.Dispatch<React.SetStateAction<Array<SelectedRoute>>>;
}): JSX.Element {
  const { city, route_type, routes_serviced, label, setDetailedRoutes } = props;
  let routes = JSON.parse(routes_serviced)
  let r_len = routes.length
  
  return (
    <div className="w-full flex text-sm">
      <dt className="flex-1 pr-2">{label}</dt>
      {routes.map((r:string, i:number) => (<dd className="flex underline text-blue-600 hover:text-blue-800 visited:text-purple-600 text-xs" key={i} onClick={()=>setDetailedRoutes([{city:city,routeType:route_type,routeServiced:r}])}>{i< r_len-1 ? r+',' : r}</dd>)
      )}
    </div>
  );
}

const EMPTY_RISK_COLOR = 'bg-slate-300';
function RiskSquares(props: {
  maxRisk: number;
  riskLevel: number;
  color: 'blue' | 'green';
}): JSX.Element {
  const { color, riskLevel, maxRisk } = props;
  const squares = Array.from({ length: maxRisk + 1 }).map((_, i) => {
    const filterColors = color === 'blue' ? getFilterGridColors([riskLevel, 2], [0, 0]) : getFilterGridColors([0, 0], [riskLevel, 2]);
    const filterColor = color === 'blue' ? filterColors[0] : filterColors[filterColors.length-1];
    const squareColor = i <= riskLevel ? filterColor : EMPTY_RISK_COLOR;
    return <div key={i} className={`h-4 w-6`} style={{ backgroundColor: squareColor }}></div>;
  });
  return <div className="flex space-x-1">{squares}</div>;
}

type Props = {
  feature: MapboxGeoJSONFeature;
  onDismiss: () => void;
  setDetailedRoutes: React.Dispatch<React.SetStateAction<Array<SelectedRoute>>>;
};

function Tooltip({ feature, onDismiss, setDetailedRoutes }: Props): JSX.Element {
  const { id, properties } = feature;

  if (!properties) {
    // render empty div if there are no properties
    return <div />;
  }

  return (
    <div id={`tooltip-${id}`} className="relative w-72 px-4 py-2">
      {/* show hospital or flooding details if there's a FEATURE_CLASS, Flooding_Category, Class property in the data */}
      {properties['FEATURE_CLASS'] || properties['Flooding_Category'] || properties['CLASS'] ? 
        <div>
          {properties['FEATURE_NAME'] && <h3 className="font-bold text-base pb-2">{properties['FEATURE_NAME']}</h3> }
          {properties['Flooding_Category'] && <h3 className="font-bold text-base pb-2">{properties['Flooding_Category']}</h3> }
          {properties['CLASS'] && <h3 className="font-bold text-base pb-2">{properties['CLASS']}</h3> }
        </div>
      : 
      <>
      <h3 className="font-bold text-base pb-2">{properties['stop_name']}</h3>
      <dl className="space-y-2">
        <DataRowLink label="Routes" setDetailedRoutes={setDetailedRoutes} 
                     city={properties.city} route_type={properties.route_type}
                     routes_serviced={properties.routes_serviced}></DataRowLink>
        <DataRow label={PROPERTY_LABELS['flood_risk_category']}>
          <RiskSquares
            color="blue"
            maxRisk={2}
            riskLevel={properties['flood_risk_category']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['access_to_hospital_category']}>
          <RiskSquares
            color="green"
            maxRisk={2}
            riskLevel={properties['access_to_hospital_category']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['job_access_category']}>
          <RiskSquares
            maxRisk={2}
            color="green"
            riskLevel={properties['job_access_category']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['worker_vulnerability_category']}>
          <RiskSquares
            maxRisk={2}
            color="green"
            riskLevel={properties['worker_vulnerability_category']}
          />
        </DataRow>
      </dl>
      <button
        onClick={onDismiss}
        className="absolute text-base font-xl -top-2.5 -right-2.5 hover:bg-slate-200 w-6 cursor-pointer transition-colors pb-0.5"
      >
        x
      </button>
      </>
      }
    </div>
  );
}

export default Tooltip;

