import { ethers } from 'hardhat';
import { FlashBot } from '../typechain-types';
import config from '../bot/config'

async function main() {

  const [signer] = await ethers.getSigners();
  const flashBot: FlashBot = (await ethers.getContractAt(
    'FlashBot',
    config.contractAddr, // your contract address
    signer
  )) as FlashBot;
  const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  const usdt = '0x55d398326f99059ff775485246999027b3197955'
  const busd = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
  await flashBot.addBaseToken(wbnb);
  console.log(`Base token added: ${wbnb}`);
  await flashBot.addBaseToken(usdt);
  console.log(`Base token added: ${usdt}`);
  await flashBot.addBaseToken(busd);
  console.log(`Base token added: ${busd}`);
}


main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
