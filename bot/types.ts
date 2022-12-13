export interface Token {
    readonly symbol: string;
    readonly address: string;
}

export interface Tokens {
    readonly [key: string]: Token;
}

export interface TokenPair {
    symbols: string;
    pairs: string[];
}

export interface ArbitragePair {
    symbols: string;
    pairs: [string, string];
}


export interface AmmFactories {
    readonly [propName: string]: {
        protocol: Protocol
        address: string
    };
}

export enum Protocol {
    UniswapV2 = 0,
    UniswapV3 = 1,
}
