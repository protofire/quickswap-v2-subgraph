# QuickSwap V2 Subgraph

This is a subgraph that tracks the Uniswap V2 protocol, indexing and exposing on-chain data such as pairs, tokens, swaps, and liquidity events for easy querying via The Graph protocol.

### Deployments

* [Base](https://api.studio.thegraph.com/query/113693/quickswap-v-2-base/version/latest)

### Setup

Copy template to subgraph.yaml
```
cp subgraph.template.yaml subgraph.yaml
```

Install deps and generate code
```
yarn
yarn codegen
```

### Running Tests

```
yarn test
```

### Deploy

```
yarn deploy:base
```