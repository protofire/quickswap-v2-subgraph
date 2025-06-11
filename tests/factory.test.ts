import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleNewPair } from "../src/mappings/factory";
import { createPairCreatedEvent, mockERC20 } from "./factory-utils";

describe("Factory", () => {
  beforeAll(() => {
    let tokenA = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let tokenB = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    let pair = Address.fromString("0x0000000000000000000000000000000000000003");
    let param3 = BigInt.fromI32(234);

    mockERC20(tokenA, "TKNA", "Token A", 18, BigInt.fromI32(1000000));
    mockERC20(tokenB, "TKNB", "Token B", 18, BigInt.fromI32(1000000));

    let newPairCreatedEvent = createPairCreatedEvent(
      tokenA,
      tokenB,
      pair,
      param3
    );
    handleNewPair(newPairCreatedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("Pair created and stored", () => {
    assert.entityCount("Pair", 1);

    assert.fieldEquals(
      "Pair",
      "0x0000000000000000000000000000000000000003",
      "token0",
      "0x0000000000000000000000000000000000000001"
    );
    assert.fieldEquals(
      "Pair",
      "0x0000000000000000000000000000000000000003",
      "token1",
      "0x0000000000000000000000000000000000000002"
    );
  });
});
