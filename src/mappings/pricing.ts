/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../../generated/schema'
import { BigDecimal } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, ONE_BD } from './helpers'

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_WETH_PAIR = '0x3099a7c284610897baaa43cbdc06469e44a06ce1' // created 10008355
const DAI_WETH_PAIR = '0x4a35582a710e1f4b2030a3f826da20bfb6703c09' // created block 10042267
const USDT_WETH_PAIR = '0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046' // created block 10093341

export function getEthPriceInUSD(): BigDecimal {
  //For now we will only use USDC_WETH pair for ETH prices
  let usdcPair = Pair.load(USDC_WETH_PAIR)
  if (usdcPair !== null) {
    return usdcPair.token1Price
  } else {
    return ZERO_BD
  }

  /**let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
    let daiWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price
      .times(daiWeight)
      .plus(usdcPair.token0Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve1)
    let daiWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    return daiPair.token1Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price
  } else {
    return ZERO_BD
  }*/
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
  '0x9BbA915F036158582C20B51113B925f243A1A1A1', // IMGN
]

let BLACKLIST: string[] = ['0x5d76fa95c308fce88d347556785dd1dd44416272']

export function isOnWhitelist(token: string): boolean {
  for (var i = 0; i < WHITELIST.length; i++) {
    if (token == WHITELIST[i]) return true
  }
  return false
}

export function isOnBlacklist(token: string): boolean {
  for (var i = 0; i < BLACKLIST.length; i++) {
    if (token == BLACKLIST[i]) return true
  }
  return false
}

export function addToBlackList(token: string): void {
  BLACKLIST.push(token)
}
// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0.01')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }

  // loop through whitelist and check if paired with any
  let whitelist = token.whitelist
  for (let i = 0; i < whitelist.length; ++i) {
    let pairAddress = whitelist[i]
    let pair = Pair.load(pairAddress)
    if (pair != null && pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
      let token1 = Token.load(pair.token1)
      if (token1 == null) return ZERO_BD
      return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
    }
    if (pair != null && pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
      let token0 = Token.load(pair.token0)
      if (token0 == null) return ZERO_BD
      return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  bundle: Bundle
): BigDecimal {
  const price0 = token0.derivedETH!.times(bundle.ethPrice)
  const price1 = token1.derivedETH!.times(bundle.ethPrice)

  // if less than 1 LPs, require high minimum reserve amount amount or return 0
  /**if (pair.liquidityProviderCount.lt(BigInt.fromI32(1))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }*/

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  bundle: Bundle
): BigDecimal {
  const price0 = token0.derivedETH!.times(bundle.ethPrice)
  const price1 = token1.derivedETH!.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
