import React from "react";
import {Contract, providers} from "ethers";
import swapAbi from './../SwapABI.json';

const SWAP_CONTRACT_ADDRESS = "0x75b446613d6E5A0DB9596aa7f2ee844f78C67C93";

const SwapInteractor = (props) => {

    const getContractData = async() => {
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractX = new Contract(SWAP_CONTRACT_ADDRESS, swapAbi, signer);

        console.log(await contractX.getIt());

        // const tx = await contractX.addCharacter(this.state.name, encodedPhrases, this.state.src);
        // await tx.wait();
    }

    return (
        <div className="my-3">
            <button
                className="bg-slate-500 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-full text-small mx-3"
                onClick={getContractData}
            >
                Get contract data
            </button>
        </div>
    );
};

export default SwapInteractor;