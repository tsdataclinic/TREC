import { MapboxGeoJSONFeature } from 'mapbox-gl';

import * as React from 'react';
import { getFilterGridColors } from './Filter';
import { PROPERTY_LABELS } from './MainPage';

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

const EMPTY_RISK_COLOR = 'bg-slate-300';
function RiskSquares(props: {
  maxRisk: number;
  riskLevel: number;
  color: 'blue' | 'green';
}): JSX.Element {
  const { color, riskLevel, maxRisk } = props;
  const squares = Array.from({ length: maxRisk + 1 }).map((_, i) => {
    const filterColors = color === 'blue' ? getFilterGridColors(riskLevel, 0) : getFilterGridColors(0, riskLevel);
    const filterColor = color === 'blue' ? filterColors[0] : filterColors[filterColors.length-1];
    const squareColor = i <= riskLevel ? filterColor : EMPTY_RISK_COLOR;
    return <div key={i} className={`h-4 w-6`} style={{ backgroundColor: squareColor }}></div>;
  });
  return <div className="flex space-x-1">{squares}</div>;
}

type Props = {
  feature: MapboxGeoJSONFeature;
  onDismiss: () => void;
};

function Tooltip({ feature, onDismiss }: Props): JSX.Element {
  const { id, properties } = feature;

  if (!properties) {
    // render empty div if there are no properties
    return <div />;
  }

  return (
    <div id={`tooltip-${id}`} className="relative w-72 px-4 py-2">
      {/* show hospital details if there's a FEATURE_CLASS property in the data */}
      {properties['FEATURE_CLASS'] ? 
        <div>
          <h3 className="font-bold text-base pb-2">{properties['FEATURE_NAME']}</h3>
          <h4 className="text-base pb-2">{properties['MAP_NAME']}</h4>
        </div>
      : 
      <>
      <h3 className="font-bold text-base pb-2">{properties['stop_name']}</h3>
      <dl className="space-y-2">
        <DataRow label="Routes">{JSON.parse(properties['routes_serviced']).join(', ')}</DataRow>
        <DataRow label={PROPERTY_LABELS['risk_category']}>
          <RiskSquares
            color="blue"
            maxRisk={2}
            riskLevel={properties['risk_category']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['access_to_hospital']}>
          <RiskSquares
            color="green"
            maxRisk={2}
            riskLevel={properties['access_to_hospital']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['jobs_cat']}>
          <RiskSquares
            maxRisk={2}
            color="green"
            riskLevel={properties['jobs_cat']}
          />
        </DataRow>
        <DataRow label={PROPERTY_LABELS['worker_vulnerability_cat']}>
          <RiskSquares
            maxRisk={2}
            color="green"
            riskLevel={properties['worker_vulnerability_cat']}
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

