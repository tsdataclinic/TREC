const Tooltip = ({feature} : any) => { 
    const { id , properties } = feature;
    return (
    <div id={`tooltip-${id}`}>
        <table>
        <tbody>
        {Object.keys(properties).map((key) => {
            return <tr key={key}>
                <td><b>{key}</b></td>
                <td>
                    {typeof properties[key] !== 'number' ?
                        properties[key] : 
                        Number.isInteger(properties[key]) ? 
                            properties[key] : 
                            Number.parseFloat(properties[key]).toFixed(2)
                    }
                </td>
            </tr>
        })}
        </tbody>
        </table>
    </div>
    );
};

export default Tooltip;