import { MapboxGeoJSONFeature } from 'mapbox-gl';

import * as React from 'react';

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
  const colorClassName = color === 'blue' ? 'bg-app-blue' : 'bg-app-green';
  const squares = Array.from({ length: maxRisk + 1 }).map((_, i) => {
    const squareColor = i <= riskLevel ? colorClassName : EMPTY_RISK_COLOR;
    return <div key={i} className={`h-4 w-6 ${squareColor}`}></div>;
  });
  return <div className="flex space-x-1">{squares}</div>;
}

type Props = {
  feature: MapboxGeoJSONFeature;
  onDismiss: () => void;
};

function Tooltip({ feature, onDismiss }: Props): JSX.Element {
  const { id, properties } = feature;
  console.log(properties);

  if (!properties) {
    // render empty div if there are no properties
    return <div />;
  }

  return (
    <div id={`tooltip-${id}`} className="relative w-72 px-4 py-2">
      <h3 className="font-bold text-base pb-2">{properties['stop_name']}</h3>
      <dl className="space-y-2">
        <DataRow label="Routes">{properties['routes_serviced']}</DataRow>
        <DataRow label="Flood risk">
          <RiskSquares
            color="blue"
            maxRisk={2}
            riskLevel={properties['risk_category']}
          />
        </DataRow>
        <DataRow label="Hospital Access">
          <RiskSquares
            color="green"
            maxRisk={2}
            riskLevel={properties['access_to_hospital']}
          />
        </DataRow>
        <DataRow label="Jobs Access">
          <RiskSquares
            maxRisk={2}
            color="green"
            riskLevel={properties['jobs_cat']}
          />
        </DataRow>
      </dl>
      <button
        onClick={onDismiss}
        className="absolute text-base font-xl -top-2.5 -right-2.5 hover:bg-slate-200 w-6 cursor-pointer transition-colors pb-0.5"
      >
        x
      </button>
    </div>
  );
}

export default Tooltip;

