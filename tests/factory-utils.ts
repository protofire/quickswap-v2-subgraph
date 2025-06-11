import { createMockedFunction, newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { PairCreated } from "../generated/Factory/Factory";

export function mockERC20(
  tokenAddress: Address,
  tokenSymbol: string,
  tokenName: string,
  tokenDecimals: u8,
  totalSupply: BigInt
): void {
  createMockedFunction(tokenAddress, "symbol", "symbol():(string)").returns([
    ethereum.Value.fromString(tokenSymbol),
  ]);

  createMockedFunction(tokenAddress, "name", "name():(string)").returns([
    ethereum.Value.fromString(tokenName),
  ]);

  createMockedFunction(
    tokenAddress,
    "totalSupply",
    "totalSupply():(uint256)"
  ).returns([ethereum.Value.fromUnsignedBigInt(totalSupply)]);

  createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenDecimals)),
  ]);
}

export function createPairCreatedEvent(
  token0: Address,
  token1: Address,
  pair: Address,
  param3: BigInt
): PairCreated {
  let pairCreatedEvent = changetype<PairCreated>(newMockEvent());

  pairCreatedEvent.parameters = new Array();

  pairCreatedEvent.parameters.push(
    new ethereum.EventParam("token0", ethereum.Value.fromAddress(token0))
  );
  pairCreatedEvent.parameters.push(
    new ethereum.EventParam("token1", ethereum.Value.fromAddress(token1))
  );
  pairCreatedEvent.parameters.push(
    new ethereum.EventParam("pair", ethereum.Value.fromAddress(pair))
  );
  pairCreatedEvent.parameters.push(
    new ethereum.EventParam("param3", ethereum.Value.fromUnsignedBigInt(param3))
  );

  return pairCreatedEvent;
}
