import { BigNumber, BigNumberish, utils } from 'ethers'


interface Config {
    contractAddr: string;
    logLevel: string;
    minimumProfit: number;
    bscScanUrl: string;
    gasPrice: BigNumber;
    gasLimit: BigNumberish;
}

const contractAddr = '0xXXXXXXXXXXXXXXXXXXX'
const gasPrice = utils.parseUnits('10', 'gwei');
const gasLimit = 300000;

const bscScanApiKey = 'XXXXXXXXXXXXXXXXXXXXX'; // bscscan API key
const bscScanUrl = `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${bscScanApiKey}`;

const config: Config = {
    contractAddr: contractAddr,
    logLevel: 'info',
    minimumProfit: 50,
    bscScanUrl: bscScanUrl,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
}

export default config
