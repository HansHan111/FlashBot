
1. Deploy FlashBot contract.
    1.1 setting .secret.ts file. 
    1.2 run deploy script on bsc
        Run follow command on the terminal
            npx hardhat run scripts/deploy.ts --network bsc
        get the FlashBot contract address.
    1.3 add base tokens
        Run follow command on the terminal
            npx hardhat run scripts/add-basetoken.ts --network bsc
2. Run Bot
    Run follow command on the terminal
        yarn bot
    