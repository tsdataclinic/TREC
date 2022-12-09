const Tooltip = ({feature} : any) => { 
    const { id , properties } = feature;
    return (
    <div id={`tooltip-${id}`} className="w-96  block">
        <span className="font-bold">{properties['stop_name']}</span>
        <table>
        <tbody>
            <tr>
                <td>Routes: </td>
                {/* <td>{(properties['routes_serviced']).join(", ")}</td> */}
            </tr>
            <tr>
                <td>Flood risk: </td>
                {/* <td>{properties['risk_category'].map(() => ('x'))}</td> */}
                <td>{properties['risk_category']}</td>
            </tr>
            <tr>
                <td>Hospital Access: </td>
                <td className="grid gap-1 grid-cols-3 grid-rows-1">
                    {properties['access_to_hospital']}
                </td>
            </tr>
            <tr>
                <td>Jobs Access: </td>
                <td className="w-full grid gap-2 grid-cols-3 grid-rows-1">
                    {[...Array(3)].map((_, i) => (
                        <span className={`${ i <= properties['jobs_cat'] ? `bg-cyan-600` : `bg-slate-300`}`}>x</span>
                    ))}
                </td>
            </tr>
        </tbody>
        </table>
    </div>
    );
};

export default Tooltip;