// GET reserves rathern than get amounts in / out

// Or get amounts in / out with 1 of the tokenA

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { Component } from "react";
// import sass from './sass/app.scss';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

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
        }
        ]
    }

    render() {
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

        const getTokenDayData = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
                    {
                        query: `
                        {
                             tokenDayDatas(first: 3, orderBy: date, orderDirection: desc, where: { token: "0x5caf454ba92e6f2c929df14667ee360ed9fd5b26"}) 
                             { 
                                 id 
                                 date 
                                 token { 
                                     id 
                                     symbol 
                                 } 
                                 priceUSD,
                             }
                        }
                    `
                    }
                )

                console.log(result);
                this.setState({
                    loading: false,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
            }
        }

        const getPoolDayData = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                             poolDayDatas(first: 3, orderBy: date, orderDirection: desc, where: { pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"}) 
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
                                 token0price,
                                 token1price,
                             }
                        }
                    `
                    }
                )

                console.log(result);
                this.setState({
                    loading: false,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
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
                            pools(where: { token0: "${token0.address}", token1: "${token1.address}" }) {
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
                        toast.info(`Pool not found, using WETH to connect ${token0.symbol} and ${token1.symbol}`, {
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
                            hasPool: true
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
                />
                {/* Same as */}
                <ToastContainer />
                <br></br>
                {this.state.loading && <code>loading</code>}
                <br></br>
                <code><h1>{this.state.token0.symbol}-{this.state.token1.symbol}</h1></code>
                {this.state.filled && <code>{!this.state.hasPool && <h4>{this.state.token0.symbol}-WETH-{this.state.token1.symbol}</h4>}</code>}
                {this.state.pairs.map((item) => {
                    let pair = `${item.token0.symbol}-${item.token1.symbol}`;
                    return (
                    <div key={pair}>
                        <br></br>
                        <button onClick={() => fill(item.token0, item.token1)}>{pair}</button>
                    </div>
                )
                })}
            </div>
        );
    }
}

export default App;