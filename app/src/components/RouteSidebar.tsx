import {SelectedRoute } from './MainPage';
import {RouteSummary} from '../hooks/useRouteSummary';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BarChart from './ui/Chart'

function LineLabel(props: {
    children: React.ReactNode;
    label: string;
  }): JSX.Element {
    const { children, label } = props;
    return (
        <div className="flex flex-col pl-4 space-y-2">{label} "Line"</div>        
    );
  }

type RouteProps = {
    routeSummary: Array<RouteSummary>;
    // routes: Array<Record<string, RouteRecord>>;
    detailedRoutes: SelectedRoute;
    setDetailedRoutes: React.Dispatch<React.SetStateAction<SelectedRoute>>;
  };

function RouteSummaryPane({
    routeSummary,
    detailedRoutes,
    setDetailedRoutes,
  }: RouteProps): JSX.Element {  
    return (
        <div
            id="SummaryPane"
            className="bg-white w-1/5 min-w-fit max-w-sm h-full shadow flex flex-col"
        >
            
            <div className="w-full flex pl-4">
                <FontAwesomeIcon 
                    icon={IconType.faArrowLeft} 
                    onClick={()=>{setDetailedRoutes({city:'',routeType:'',routeServiced:''})}}
                    className="text-base font-xl hover:bg-slate-200 cursor-pointer transition-colors pt-3"/>
                <b className="pl-4 pt-2">{detailedRoutes.routeServiced}</b>
            </div>
            
            <div className="flex flex-col pl-11 space-y-2">
                {detailedRoutes.routeType} Route
            </div>

            <div className="flex flex-col pt-10 pl-4 space-y-2"><b>Total Stops</b></div>

            <div className="flex flex-col pt-2 pl-4 space-y-2">
                <b className="text-xl">{JSON.stringify(routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['count'])}</b>
            </div>

            <BarChart label='Flood Risk' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['flood_risk']}></BarChart>

            <BarChart label='Access to Hospitals' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['access_to_hospital']}></BarChart>
            
            <BarChart label='Access to Jobs' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['jobs_cat']}></BarChart>

            <BarChart label='Vulnerable workers' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['worker_vulnerability_cat']}></BarChart>

            
        </div>
        );

  }
  
  export default RouteSummaryPane;