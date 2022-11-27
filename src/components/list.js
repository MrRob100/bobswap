import React, {useEffect, useState} from "react";

const List = (props) => {

    const [token0, setToken0] = useState({id: "", symbol: ""});
    const [token1, setToken1] = useState({id: "", symbol: ""});

    useEffect(() => {
        const fetchData = async() => {
            await props.allPools();
        }

        fetchData();

    }, []);

    useEffect(() => {
        console.log(token0.symbol, token1.symbol);

        //this method will be in parent
        //props.checkIfPool(token0.id, token1, id)

    }, [token0, token1]);

    const fill = () => {
        console.log('fill');
    }

    return (
        <div className="App">
            <div className="grid grid-cols-2 gap-4">
                <div className="h-80 overflow-scroll bg-slate-100">
                    <ul>
                        {props.pools.length > 0 && props.pools.map((item, index) => {
                            let active = item.token1.id === token0.id ? 'bg-slate-300' : '';
                            return(
                                <li onClick={() => setToken0(item.token1)} key={index} className={`hover:${active ? active : 'bg-slate-200'} cursor-pointer ${active}`}>
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
                            return(
                                <li onClick={() => setToken1(item.token1)} key={index} className={`hover:${active ? active : 'bg-slate-200'} cursor-pointer ${active}`}>
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