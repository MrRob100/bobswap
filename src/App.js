// GET reserves rathern than get amounts in / out

// Or get amounts in / out with 1 of the tokenA

import './App.css';
import React, { Component } from "react";
// import sass from './sass/app.scss';
import axios from "axios";

class App extends Component {

    state = {
        loading: false,
        pairAddresses: [],
        token0: null,
        token1: null,
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

        const getPairs = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
                    {
                        query: `
                            {
                                pairs(first: 5, orderBy: txCount, orderDirection: desc) {
                                    token0 {
                                        name,
                                        symbol,
                                        tradeVolumeUSD,
                                        totalLiquidity
                                    }
                                    token1 {
                                        name,
                                        symbol,
                                        tradeVolumeUSD,
                                        totalLiquidity       
                                    },
                                    token0Price,
                                    token1Price,
                                    txCount,
                                    createdAtTimestamp,
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

        const allTokens = async () => {
            this.setState({loading: true});

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

        const poolData = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                            factories(first: 5) {
                                id
                                poolCount
                                txCount
                                totalVolumeUSD
                        }
                            bundles(first: 5) {
                                id
                                ethPriceUSD
                        }
                        }
                    `
                    }
                )

                console.log(result);
                this.setState({
                    loading: false,
                    // pairs: result.data.data.pairs,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
            }
        }

        const main = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
                    {
                        query: `
                        {
                            pairs {
                                id
                            }
                        }
                    `
                    }
                )

                console.log(result);
                this.setState({
                    loading: false,
                    pairAddresses: result.data.data.pairs,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
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

        const getPools = async () => {
            this.setState({loading: true});

            try {
                const result = await axios.post(
                    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                    {
                        query: `
                        {
                            pools(orderBy: volumeUSD, orderDirection: desc, first: 10) {
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
                this.setState({
                    loading: false,
                    // pairs: result.data.data.pairs,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
            }
        }

        const fill = async (token0, token1) => {
            this.setState({loading: true});

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
                this.setState({
                    loading: false,
                    // pairs: result.data.data.pairs,
                });

            } catch(e) {
                console.error(e);
                this.setState({loading: false});
            }
        }

        return (
            <div className="App">
                <br></br>
                {this.state.loading && <code>loading</code>}
                <br></br>
                <button onClick={main}><code>uniswap graphql</code></button>
                <br></br>
                <br></br>
                <button onClick={poolData}><code>pool data</code></button>
                <br></br>
                <br></br>
                <button onClick={getPools}><code>get pools</code></button>
                <br></br>
                <br></br>
                <button onClick={getPairs}><code>get pairs</code></button>
                <br></br>
                <br></br>
                <button onClick={getTokenDayData}><code>get token day data</code></button>
                <br></br>
                <br></br>
                <button onClick={getPoolDayData}><code>get pool day data</code></button>
                <br></br>
                <br></br>
                <button onClick={allTokens}><code>all tokens</code></button>
                {this.state.pairAddresses.map((item) => {
                    return <p key={item.id}>{item.id}</p>
                })}
                <br></br>
                <hr></hr>
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