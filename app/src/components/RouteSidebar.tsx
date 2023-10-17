import {SelectedRoute } from './MainPage';
import {RouteSummary} from '../hooks/useRouteSummary';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BarChart from './ui/Chart'

function mode(arr:Array<String>){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

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
            className="bg-white min-w-fit h-full shadow flex flex-col"
        >
            {/* min-w-max max-w-sm */}
            
            <div className="p-2 border-b border-b-slate-400">
                <FontAwesomeIcon 
                    icon={IconType.faArrowLeft} 
                    onClick={()=>{setDetailedRoutes({city:'',routeType:'',routeServiced:''})}}
                    className="text-base font-xl hover:bg-slate-200 cursor-pointer transition-colors pt-3"/>
                <b className="pl-4 pt-2">{detailedRoutes.routeServiced}</b>
                <div className="flex flex-col pl-7 space-y-2">
                    {mode(routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['agency'].split(','))} 
                </div>
                <div className="flex flex-col pl-7 space-y-2">
                    {detailedRoutes.routeType} Route
                </div>
                
            </div>
            

            <div className="flex flex-col pt-4 pl-4 space-y-2"><b>Total Stops</b></div>

            <div className="flex flex-col pt-2 pl-4 space-y-2">
                <b className="text-xl">{JSON.stringify(routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['count'])}</b>
            </div>

            <BarChart label='Flood Risk' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['flood_risk']}></BarChart>
            
            <BarChart label='Heat Risk' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['heat_risk']}></BarChart>
            
            <BarChart label='Fire Risk' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['fire_risk']}></BarChart>

            <BarChart label='Access to Hospitals' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['hospital_access']}></BarChart>
            
            <BarChart label='Access to Jobs' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['job_access']}></BarChart>

            <BarChart label='Vulnerable workers' data={routeSummary.filter(function(e:any) {return e.route == detailedRoutes.routeServiced})[0]['worker_vulnerability']}></BarChart>

            
        </div>
        );

  }
  
  export default RouteSummaryPane;