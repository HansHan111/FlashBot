import { ethers } from "hardhat";
import { FlashBot } from "../typechain-types";
import config from './config'
import { getTokens, Network, tryLoadPairs } from "./tokens"
import pool from '@ricokahler/pool'
import AsyncLock from 'async-lock'
import log from './log'
import { BigNumber } from "ethers";
import { getBnbPrice } from "./basetoken-price";
import { ArbitragePair, Tokens } from "./types";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function calcNetProfit(profitWei: BigNumber, address: string, baseTokens: Tokens): Promise<number> {
    let price = 1;

    const bnbPrice = await getBnbPrice()
    if (baseTokens.wbnb.address == address) {
        price = bnbPrice;
    }
    let profit = parseFloat(ethers.utils.formatEther(profitWei))
    profit = profit * price

    const gasCost = bnbPrice * parseFloat(ethers.utils.formatEther(config.gasPrice)) * (config.gasLimit as number);

    return profit - gasCost;
}

function arbitrageFunc(flashBot: FlashBot, baseTokens: Tokens) {
    const lock = new AsyncLock({ timeout: 2000, maxPending: 20 });
    return async function arbitrage(pair: ArbitragePair) {
        const [pair0, pair1] = pair.pairs;

        let res: [BigNumber, string] & {
            profit: BigNumber;
            baseToken: string
        }
        try {
            res = await flashBot.getProfit(pair0, pair1)
            log.debug(`Profit on ${pair.symbols}: ${ethers.utils.formatEther(res.profit)}`);
        } catch (err) {
            log.debug(`on error ${pair.symbols}: ${pair0}, ${pair1}`)
            log.debug(err)
            return
        }
        if (res.profit.gt(BigNumber.from('0'))) {
            const netProfit = await calcNetProfit(res.profit, res.baseToken, baseTokens);
            // log.info(`Profit on ${pair.symbols}: ${ethers.utils.formatEther(res.profit)}`)
            // log.info(`NetProfit on ${pair.symbols}: ${netProfit}`)
            if (netProfit < config.minimumProfit) {
                return;
            }

            log.info(`Calling flash arbitrage, net profit: ${netProfit}`);

            try {
                await lock.acquire('flash-bot', async () => {
                    const response = await flashBot.flashArbitrage(pair0, pair1, {
                        gasPrice: config.gasPrice,
                        gasLimit: config.gasLimit
                    })

                    const receipt = await response.wait(1);
                    log.info(`Tx: ${receipt.transactionHash}`);
                })
            } catch (err: any) {
                if (err.message === 'Too much pending tasks' || err.message === 'async-lock timed out') {
                    return;
                }
                log.error(err);
            }
        }
    }
}

async function main() {
    const pairs = await tryLoadPairs(Network.BSC);
    const flashBot = (await ethers.getContractAt('FlashBot', config.contractAddr)) as FlashBot;
    const [baseTokens] = getTokens(Network.BSC);

    log.info('Start arbitraging')
    while (true) {
        await pool({
            collection: pairs,
            task: arbitrageFunc(flashBot, baseTokens)
        })
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        log.error(err);
        process.exit(1)
    })