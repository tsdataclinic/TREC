// import { Layer } from '../App';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { COLORS } from "../utils/sourceLayerConfigs";

// import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
type Props = {
  selectedProperties: Array<string>
}

function Filter(props : Props) : JSX.Element {
  return (
    <div id="Filter" className="bg-white w-72 h-72 bottom-16 fixed z-50 right-4 flex flex-col justify-center items-center">
      {/* <div className="h-5/6 flex"> */}
        {/* <div className="w-1/6 rotate-90">
          {props.selectedProperties[0]}
        </div> */}
        <div className="h-2/3 w-2/3 grid gap-0 grid-cols-3 grid-rows-3">
          <span style={{backgroundColor: COLORS.darkgreen}}></span>
          <span style={{backgroundColor: COLORS.darkblue}}></span>
          <span style={{backgroundColor: COLORS.darkred}}></span>
          <span style={{backgroundColor: COLORS.mediumgreen}}></span>
          <span style={{backgroundColor: COLORS.mediumblue}}></span>
          <span style={{backgroundColor: COLORS.mediumred}}></span>
          <span style={{backgroundColor: COLORS.lightgreen}}></span>
          <span style={{backgroundColor: COLORS.lightblue}}></span>
          <span style={{backgroundColor: COLORS.lightred}}></span>
        </div>
      {/* </div> */}
      {/* <div className="h-1/6">
        {props.selectedProperties[1]}
      </div> */}
    </div>
  );
}

export default Filter;
