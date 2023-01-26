import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { COLORS } from '../../../utils/sourceLayerConfigs';
import { JsxElement } from 'typescript';


function ColorBar(props: {
    width: string;
    color: string;
}): JSX.Element {
    const { width, color } = props;
    console.log(typeof(width+'%'))
    return (
        <div className="flex-2 w-3/5 h-5 bg-slate-200 ">
            <div className="h-5" style={{width: width+'%', backgroundColor: color}}></div>
        </div>
    )
}

export default function BarChart(props: {
    data: Array<number>;
    label: string;
  }): JSX.Element {
    const { data, label } = props;
    const sum = data.reduce((partialSum, a) => partialSum + a, 0);
    const pcts = data.map(k => ((k/sum * 100).toFixed(0)))
    let colors = [COLORS.darkred, COLORS.mediumred, COLORS.lightred];
    if (label == 'Flood Risk'){
        colors = [COLORS.deepblue,COLORS.darkgreen, COLORS.mediumgreen]
    } else if (label == 'Access to Hospitals') {
        colors = [COLORS.darkblue, COLORS.mediumblue, COLORS.lightblue]
    }
    return (
            <div>
                <div className="w-full flex text-sm pt-8 pl-4">
                    <dt className="flex-1">{label}</dt>
                    <dd className="pl-20 pr-4"># of stations</dd>
                </div>
                <div className="w-full flex text-sm pt-2 pl-4">
                    <dt className="flex-1">High</dt>
                    <ColorBar width={pcts[2]} color={colors[0]}></ColorBar>
                    <dd className="flex-3 pl-2 pr-4">{data[2]} ({pcts[2]}%)</dd>
                </div>
                <div className="w-full flex text-sm pt-2 pl-4">
                    <dt className="flex-1">Med</dt>
                    <ColorBar width={pcts[1]} color={colors[1]}></ColorBar>
                    <dd className="flex-3 pl-2 pr-4">{data[1]} ({pcts[1]}%)</dd>
                </div>
                <div className="w-full flex text-sm pt-2 pl-4">
                    <dt className="flex-1">Low</dt>
                    <ColorBar width={pcts[0]} color={colors[2]}></ColorBar>
                    <dd className="flex-3 pl-2 pr-4">{data[0]} ({pcts[0]}%)</dd>
                </div>
            </div>
        
    )


  }