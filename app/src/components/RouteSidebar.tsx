import {EMPTY_SELECTED_ROUTE, SelectedRoute } from './MainPage';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BarChart from './ui/Chart'
import { RouteSummaryResponse } from '../hooks/useRemoteRouteSummary';


type RouteProps = {
    status: string;
    routeSummary: RouteSummaryResponse;
    detailedRoutes: SelectedRoute;
    setDetailedRoutes: React.Dispatch<React.SetStateAction<SelectedRoute>>;
  };

function RouteSummaryPane({
    status,
    routeSummary,
    detailedRoutes,
    setDetailedRoutes,
  }: RouteProps): JSX.Element {  
    return (
        <div
            id="SummaryPane"
            className="bg-white min-w-fit h-full shadow flex flex-col overflow-y-scroll"
        >
            <div className="p-2 border-b border-b-slate-400">
                <FontAwesomeIcon 
                    icon={IconType.faArrowLeft} 
                    onClick={()=>{setDetailedRoutes(EMPTY_SELECTED_ROUTE)}}
                    className="text-base font-xl hover:bg-slate-200 cursor-pointer transition-colors pt-3"/>
                <b className="pl-4 pt-2">
                    {status === 'loading' ? 'Loading...' : detailedRoutes.routeServiced}
                </b>
                <div className="flex flex-col pl-7 space-y-2">
                    {status === 'loading' ? 'Loading...' : detailedRoutes.routeType}
                </div>
                {/* <div className="flex flex-col pl-7 space-y-2 w-20">
                    {status === 'loading' ? 'Loading...' : routeSummary.agency }
                </div> */}
            </div>
            <div className="flex flex-col pt-4 pl-4 space-y-2">
                <b>Total Stops</b></div>
            <div className="flex flex-col pt-2 pl-4 space-y-2">
                <b className="text-xl">
                    {routeSummary?.count}
                </b>
            </div>
            <BarChart label='Flood Risk' data={status === 'success' ? routeSummary.flood_risk_category_local : [0,0,0]}></BarChart>
            <BarChart label='Heat Risk' data={status === 'success' ? routeSummary.heat_risk_category_local : [0,0,0]}></BarChart>
            <BarChart label='Wildfire Risk' data={status === 'success' ? routeSummary.wildfire_risk_category_national : [0,0,0]}></BarChart>
            <BarChart label='Access to Hospitals' data={status === 'success' ? routeSummary.access_to_hospital_category : [0,0,0]}></BarChart>
            <BarChart label='Access to Jobs' data={status === 'success' ? routeSummary.job_access_category : [0,0,0]}></BarChart>
            <BarChart label='Vulnerable workers' data={status === 'success' ? routeSummary.worker_vulnerability_category : [0,0,0]}></BarChart>
        </div>
        );

  }
  
  export default RouteSummaryPane;