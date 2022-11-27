import React, {useEffect, useState} from "react";

const List = (props) => {

    useEffect(() => {
        const fetchData = async() => {
            await props.allPools();
        }

        fetchData();

    }, []);

    const fill = () => {
        console.log('fill');
    }

    return (
        <div className="App">
            <div className="grid grid-cols-2 gap-4">
                <div className="h-80 overflow-scroll bg-slate-100">
                    <ul>
                        {props.pools.length > 0 && props.pools.map((item, index) => {
                            console.log(item);
                            return(
                                <li onClick={fill} key={index} className="hover:bg-slate-200 cursor-pointer">
                                    <span>{item.token1.symbol}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="h-80 overflow-scroll bg-slate-100">
                    <ul>
                        {props.pools.length > 0 && props.pools.map((item, index) => {
                            return(
                                <li onClick={fill} key={index} className="hover:bg-slate-200 cursor-pointer">
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