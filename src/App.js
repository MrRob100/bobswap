// GET reserves rathern than get amounts in / out

// Or get amounts in / out with 1 of the tokenA

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, {Component} from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import List from "./components/List";
import Charts from "./components/Charts";
import {Contract, providers, utils} from "ethers";

const USDCAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const NETWORKS = {
    1: "Mainnet",
    5: "Goerli testnet",
};

class App extends Component {

    state = {
        chart0Data: [],
        chart01Data: [],
        chart1Data: [],
        dates: [],
        filled: false,
        hasPool: false,
        loading: false,
        networkName: null,
        pools: [],
        provider: null,
        token0: {address: "", symbol: ""},
        token1: {address: "", symbol: ""},
        walletAddress: null,
        walletProvider: null,
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
                             poolDayDatas(first: 5, orderBy: date, orderDirection: desc, where: { pool: "${poolId}" }) 
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

        const requestAccount = async () => {
            console.log('Requesting account...');

            // ❌ Check if Meta Mask Extension exists
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });

                    const provider = this.state.provider ? this.state.provider : new providers.Web3Provider(window.ethereum);
                    this.setState({walletProvider: provider.connection.url});
                    const balance = await provider.getBalance(accounts[0]);

                    this.setState({
                        provider,
                        walletAddress: accounts[0],
                        walletProvider: provider.connection.url,
                        ethBalance: utils.formatEther(balance),
                        networkName: NETWORKS[provider._network.chainId],
                    });

                } catch (error) {
                    toast.error(error.message, {
                        position: "top-right",
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                }

            } else {
                alert('Meta Mask not detected, only read-only functions available');
            }
        }

        const getBalance = async(tokenAddress) => {
            if (window.ethereum) {

                const provider = this.state.provider ? this.state.provider : new providers.Web3Provider(window.ethereum);

                // const ethers = require('ethers');
                const genericErc20Abi = require("./Erc20ABI.json");


                // const tokenContractAddress = tokenAddress;
                const tokenContractAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";


                // const tokenContractAddress = '0x...';
                const contract = new Contract(tokenContractAddress, genericErc20Abi, provider);

                // const signer = provider.getSigner(this.state.walletAddress);

                // const balance = (await contract.balanceOf(signer).toString());

                // DAIBalance = await DAI.balanceOf(owner.address)

                // 0xa9E414f82a73c0B761D06fAc24EbA2fE99903be4 // chainlink address
                let chainlinkAddress = "0xa9E414f82a73c0B761D06fAc24EbA2fE99903be4";

                const balance = await contract.balanceOf(chainlinkAddress);

                console.log(utils.formatEther(balance));

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
                /><ToastContainer />

                <div className="w-full h-20 bg-slate-100 grid grid-cols-3">
                    <div>
                        <div className="flex h-full justify-center items-center">
                            {this.state.loading && <code>loading</code>}
                            {
                                this.state.token0.symbol !== "" &&
                                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
                                    <code><h4 className="mx-2">{this.state.token0.symbol} {this.state.token1.symbol}</h4></code>
                                </span>
                            }
                            {
                                !this.state.hasPool && this.state.filled &&
                                <span className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
                                    <code><h4 className="mx-2">{this.state.token0.symbol}-USDC-{this.state.token1.symbol}</h4></code>
                                </span>
                            }
                        </div>
                    </div>
                    <div className="flex h-full justify-center items-center">
                        {
                            this.state.networkName &&
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800"><code>{this.state.networkName}</code></span>
                        }
                    </div>
                    <div>
                        {this.state.walletAddress ?
                            <div className="flex h-full justify-center items-center">
                                {this.state.walletProvider === "metamask" && <img className="w-10 m-2 border rounded-lg" src="metamask192.png"></img>}
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                                    <code className="text-sm">{this.state.walletAddress}</code>
                                </span>
                            </div>
                        :
                            <div className="flex h-full justify-center items-center">
                                <button
                                    onClick={requestAccount}
                                    className="bg-slate-500 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-full text-small mx-3">
                                    {window.ethereum ? 'Connect wallet' : 'Metamask wallet not detected'}
                                </button>
                            </div>
                        }
                    </div>
                </div>

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
                        <button onClick={() => getBalance(this.state.token0.id)} className="bg-slate-500 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-full text-small mx-3">
                            Get balance: {this.state.token0.symbol}
                        </button>
                        <button onClick={() => getBalance(this.state.token0.id)} className="bg-slate-500 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-full text-small mx-3">
                            Get balance: {this.state.token1.symbol}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;