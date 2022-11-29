import React, {useEffect, useState} from "react";

const List = (props) => {

    const [token0, setToken0] = useState({id: "", symbol: "", poolId: ""});
    const [token1, setToken1] = useState({id: "", symbol: "", poolId: ""});

    useEffect(() => {
        const fetchData = async() => {
            await props.allPools();
        }

        fetchData();

    }, []);

    useEffect(() => {
        if(token0.id !== "" && token1.id !== "") {
            props.checkIfPool(token0, token1);
            props.setChartData(token0.poolId, token1.poolId);
        }

    }, [token0, token1]);

    return (
        <div className="App">
            <div className="grid grid-cols-2 gap-4">
                <div className="h-80 overflow-scroll bg-slate-100">
                    <ul>
                        {props.pools.length > 0 && props.pools.map((item, index) => {
                            let active = item.token1.id === token0.id ? 'bg-slate-300' : '';
                            let data = {id: item.token1.id, symbol: item.token1.symbol, poolId: item.id}

                            return(
                                <li onClick={() => setToken0(data)} key={index} className={`hover:${active ? active : 'bg-slate-200'} cursor-pointer ${active}`}>
                                    <span>{item.token1.symbol}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="h-80 overflow-scroll bg-slate-100">
                    <ul>
                        {props.pools.length > 0 && props.pools.map((item, index) => {
                            let active = item.token1.id === token1.id ? 'bg-slate-300' : '';
                            let data = {id: item.token1.id, symbol: item.token1.symbol, poolId: item.id}

                            return(
                                <li onClick={() => setToken1(data)} key={index} className={`hover:${active ? active : 'bg-slate-200'} cursor-pointer ${active}`}>
                                    <span>{item.token1.symbol}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default List;