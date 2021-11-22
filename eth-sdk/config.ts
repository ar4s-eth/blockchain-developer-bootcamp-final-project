import {defineConfig} from '@dethcrypto/eth-sdk';

export default defineConfig({
  noFollowProxies: true,
  contracts: {
    mainnet: {
      Tokens: {
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        COMP: '0xc00e94cb662c3520282e6f5717214004a7f26888',
        DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
        USDC: '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf',
        pcUSDC: '0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7',
      },
      DeFi: {
        UniswapV2: {
          UniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
          UniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        },
        UniswapV3: {
          UniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          Multicall2: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
          // ProxyAdmin: '0xB753548F6E010e7e680BA186F9Ca1BdAB2E90cf2',
          Quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
          SwapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          NFTDescriptor: '0x42B24A95702b9986e82d421cC3568932790A48Ec',
          NonfungibleTokenPositionDescriptor: '0x91ae842A5Ffd8d12023116943e72A606179294f3',
          TransparentUpgradeableProxy: '0xEe6A57eC80ea46401049E92587E52f5Ec1c24785',
          NonfungiblePositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
          V3Migrator: '0xA5644E29708357803b5A882D272c41cC0dF92B34',
        },
        PoolTogetherV4: {
          ATokenYieldSource: '0x32e8D4c9d1B711BC958d0Ce8D14b41F77Bb03a64',
          DrawBeacon: '0x0D33612870cd9A475bBBbB7CC38fC66680dEcAC5',
          DrawBuffer: '0x78Ea5a9595279DC2F9608283875571b1151F19D4',
          DrawCalculator: '0x14d0675580C7255043a3AeD3726F5D7f33292730',
          DrawCalculatorTimelock: '0x6Ab2C44A548b8ac1D166Afbf490B200Ad4261c15',
          L1TimelockTrigger: '0xdC90a79fcb1DBAd5F05E6C264F84AC4b0d351F94',
          PrizeDistributionBuffer: '0xf025a8d9E6080F885e841C8cC0E324368D7C6577',
          PrizeDistributor: '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe',
          PrizeFlush: '0x2193b28b2BdfBf805506C9D91Ed2021bA6fBc888',
          PrizeSplitStrategy: '0x47a5ABfAcDebf5af312B034B3b748935A0259136',
          PrizeTierHistory: '0xdD1cba915Be9c7a1e60c4B99DADE1FC49F67f80D',
          Reserve: '0xadB4D93D84b18b5D82063aCf58b21587c92fdfb5',
          Ticket: '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
          YieldSourcePrizePool: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be',
        },
      },
    },
  },
});
