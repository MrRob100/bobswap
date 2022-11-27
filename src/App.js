// GET reserves rathern than get amounts in / out

// Or get amounts in / out with 1 of the tokenA

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, {Component, useEffect} from "react";
import Chart from 'chart.js';

// import sass from './sass/app.scss';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import List from "./components/list";

const USDCAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

class App extends Component {

    state = {
        loading: false,
        hasPool: false,
        filled: false,
        pairAddresses: [],
        token0: {address: null, symbol: null},
        token1: {address: null, symbol: null},
        pairs: [
            {
                token0: {
                    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    symbol: "USDC"
                },
                token1: {
                    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    symbol: "WETH"
                }
            },
            {
                token0: {
                    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                    symbol: "SHIB"
                },
                token1: {
                    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
                    symbol: "LINK"
                }
            },
            {
                token0: {
                    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    symbol: "WETH"
                },
                token1: {
                    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
                    symbol: "LINK"
            }
        }
        ],
        pools: [],
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

                console.log(result);

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

        // getPools();

        //pass this function to props of list

        const allTokens = async () => {
            this.setState({
                loading: true,
                filled: false,
            });

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
                    {
                        query: `
                            {
                                tokens {
                                    symbol
                                    name
                                    decimals  
                                }
                            }
                        `
                    }
                )

                console.log(result);
            } catch(e) {
                console.error(e);
            }
        }

        const getPoolDayData = async (poolId) => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                             poolDayDatas(first: 3, orderBy: date, orderDirection: desc, where: { pool: "${poolId}" }) 
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

                    // this.setState({
                    //     pairPrices: result.data.data.poolDayDatas
                    // });

                    //

                    //need to set token0price and token1price individ, even if it means looping through
                    //THEN WE CAN REUSE THIS FUNCTION


                } else {
                    //toasty eror
                    return [];
                }

                console.log(result);
                this.setState({
                    loading: false,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
                return [];
            }
        }

        const fill = async (token0, token1) => {
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
                            pools(where: { token0: "${token0.address}", token1: "${token1.address}"}, first: 1) {
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

                console.log(result);
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

                        console.log(token0, token1);

                        //construct
                        // getPoolDayData()
                        //we have the token ids,

                        //getPools to find pool id of token0 and USDC
                        //getPools to find pool id of token1 and USDC
                        
                        // getPoolDayData(pool0Id);
                        // getPoolDayData(pool1Id);

                    } else {
                        this.setState({
                            hasPool: true,
                        })

                        const poolData = await getPoolDayData(result.data.data.pools[0].id);
                        console.log('poolData', poolData);
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

        const getTokenData = async (tokenAddress) => {
            this.setState({loading: true});

            // pools(where: { OR: [
            //     { AND: [{token0: { eq: "${tokenAddress}" }}, {token1: { eq: "${USDCAddress}" }} ]},
            //     { AND: [{token0: { eq: "${USDCAddress}" }}, {token1: { eq: "${tokenAddress}" }} ]},
            // ]})

            // pools(where: { token0: "${tokenAddress}", token1: "${USDCAddress}"}, first: 1) {

                console.log(tokenAddress);

                try {
                    const result = await axios.post(
                        'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                        {
                            query: `
                        {
                            pools(where: { token1: "0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B"}) {
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

                this.setState({
                    loading: false,
                    // pairs: result.data.data.pairs,
                });

                // return result.data.data[0]
                return result;

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
                return null;
            }
        }

        const getLinkPool = async() => {
            let pool = await getTokenData("0x514910771AF9Ca656af840dff83E8264EcF986CA");
            console.log(pool);
        }

        return (
            <div className="App">
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
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <List allPools={getPools} pools={this.state.pools}></List>
                    </div>
                    <div></div>
                    <div></div>
                </div>

                <br></br>
                {this.state.loading && <code>loading</code>}
                <br></br>
                <code><h1>{this.state.token0.symbol}-{this.state.token1.symbol}</h1></code>
                {this.state.filled && <code>{!this.state.hasPool && <h4>{this.state.token0.symbol}-USDC-{this.state.token1.symbol}</h4>}</code>}
                {this.state.pairs.map((item) => {
                    let pair = `${item.token0.symbol}-${item.token1.symbol}`;
                    return (
                    <div key={pair}>
                        <br></br>
                        <button onClick={() => fill(item.token0, item.token1)}>{pair}</button>
                    </div>
                )
                })}
                <button onClick={getLinkPool}><code>Get Link Token Data</code></button>
                <canvas id="chartToken0"></canvas>
            </div>
        );
    }
}

export default App;