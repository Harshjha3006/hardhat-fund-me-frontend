import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;
connectButton.onclick = connect;
fundButton.onclick = fund;
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(balance);
        console.log(ethers.utils.formatEther(balance));
    }
    else {
        balanceButton.innerText = "Please Install Metamask!";
    }
}
async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
        console.log("Withdrawing ...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const txResponse = await contract.withdraw();
        await listenForTransactionMine(txResponse, provider);
        console.log("Withdrawn");
    }
    else {
        withdrawButton.innerText = "Please Install MetaMask!";
    }
}
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerText = "Connected!";
    } else {
        connectButton.innerText = "Please Install Metamask!";
    }
}
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Waiting for ${transactionResponse.hash} to get mined ...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Transaction Mined with ${transactionReceipt.confirmations} confirmations ...`);
            resolve();
        })
    })
}
async function fund() {
    const ethAmount = document.getElementById("ethAmountForm").value;
    if (typeof window.ethereum !== "undefined") {
        console.log(`Funding with ${ethAmount} ...`);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
            await listenForTransactionMine(transactionResponse, provider);
        }
        catch (e) {
            console.error(e);
        }
        console.log("Funded!");
    }
    else {
        fundButton.innerText = "Please install MetaMask!";
    }
}