// GET reserves rathern than get amounts in / out

// Or get amounts in / out with 1 of the tokenA

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, {Component, useState} from "react";

// import sass from './sass/app.scss';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import List from "./components/List";
import Charts from "./components/Charts";

const USDCAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

class App extends Component {

    state = {
        loading: false,
        hasPool: false,
        filled: false,
        pairAddresses: [],
        token0: {address: "", symbol: ""},
        token1: {address: "", symbol: ""},
        pools: [],
        chart0Data: [],
        chart01Data: [],
        chart1Data: [],
        dates: [],
    }

    render() {
        const getPools = async () => {
            this.setState({loading: true});

            //where token1 is USDC

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                            pools(orderBy: volumeUSD, orderDirection: desc, first: 50, where: { token0: "${USDCAddress}"}) {
                                id,
                                token0 {
                                    id,
                                    symbol
                                }
                                token1 {
                                    id,
                                    symbol
                                }
                            }
                        }
                    `
                    }
                )

                this.setState({
                    loading: false,
                    // pairs: result.data.data.pairs,
                });

                //set state here then pass to child as props
                if(result.data.data.pools && result.data.data.pools.length > 0) {
                    this.setState({
                        pools: result.data.data.pools,
                    })
                } else {
                    //handle
                }

                return result;

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
                return [];
            }
        }

        const getPoolDayData = async (poolId) => {
            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                             poolDayDatas(first: 4, orderBy: date, orderDirection: desc, where: { pool: "${poolId}" }) 
                             { 
                                 id 
                                 date 
                                 pool { 
                                     id 
                                 } 
                                 open,
                                 high,
                                 low,
                                 close,
                                 token0Price,
                                 token1Price,
                             }
                        }
                    `
                    }
                )

                if (result.data.data.poolDayDatas) {
                    return result.data.data.poolDayDatas;
                } else {
                    return [];
                }
            } catch(e) {
                console.error(e);
                return [];
            }
        }

        const checkIfPool = async (token0, token1) => {
            this.setState({
                loading: true,
                token0,
                token1,
                filled: false,
            });

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                            pools(where: { token0: "${token0.id}", token1: "${token1.id}"}, first: 1) {
                                id,
                                token0 {
                                    id,
                                    symbol
                                }
                                token1 {
                                    id,
                                    symbol
                                }
                                poolHourData
                            }
                        }
                    `
                    }
                )

                if (result.data.errors) {
                    console.error(result.data.errors);

                    result.data.errors.map(error => {
                        toast.error(error.message, {
                            position: "top-right",
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                    });
                    this.setState({
                        filled: false
                    })
                } else {
                    if (result.data.data.pools.length === 0) {
                        toast.info(`Pool not found, using USDC to connect ${token0.symbol} and ${token1.symbol}`, {
                            position: "top-right",
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                        this.setState({
                            hasPool: false
                        })
                    } else {
                        this.setState({
                            hasPool: true,
                        })
                    }
                }

                this.setState({
                    loading: false,
                    filled: true,
                });

            } catch(e) {

                //toastie too
                console.error(e);
                this.setState({loading: false});
            }
        }

        const setChartData = async(token0Pool, token1Pool) => {
            const token0PoolData = await getPoolDayData(token0Pool);
            const token1PoolData = await getPoolDayData(token1Pool);

            let dates = [];
            let priceDataToken0 = [];
            token0PoolData.map((item) => {
                priceDataToken0.push(parseFloat(item.token0Price));
                let date = new Date(item.date * 1000);
                dates.push(date.toLocaleDateString("en-GB"));
            });

            let priceDataToken01 = []
            let priceDataToken1 = [];
            token1PoolData.map((item, index) => {
                let token0Price = parseFloat(item.token0Price);
                priceDataToken1.push(token0Price);
                priceDataToken01.push(priceDataToken0[index] / token0Price);
            });

            dates.reverse();

            this.setState({
                chart0Data: priceDataToken0.reverse(),
                chart01Data: priceDataToken01.reverse(),
                chart1Data: priceDataToken1.reverse(),
                dates,
            });
        }

        return (
            <div className="App mt-20">
                <ToastContainer
                    position="top-right"
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                /><ToastContainer />
                {this.state.loading && <code className="absolute">loading</code>}
                <code><h1 className="text-xxl bold">{this.state.token0.symbol} {this.state.token1.symbol}</h1></code>
                {this.state.filled && <code>{!this.state.hasPool && <h4>{this.state.token0.symbol}-USDC-{this.state.token1.symbol}</h4>}</code>}
                <div className="grid grid-cols-5 gap-4">
                    <div>
                        <List
                            allPools={getPools}
                            checkIfPool={checkIfPool}
                            pools={this.state.pools}
                            setChartData={setChartData}>
                        </List>
                    </div>
                    <div className="col-span-4">
                        <Charts
                            token0prices={this.state.chart0Data}
                            token01prices={this.state.chart01Data}
                            token1prices={this.state.chart1Data}
                            dates={this.state.dates}
                            token0={this.state.token0.symbol}
                            token1={this.state.token1.symbol}
                        >
                        </Charts>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;