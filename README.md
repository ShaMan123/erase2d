# Erase2d

A simple erasing tool.

Currently supports [fabric](./packages/fabric/README.md) out of the box.

The plan is to expose more bindings.
Contributions are welcome, ping me in a feature request.

## Dev

Start the [sandbox app](./packages/sandbox/README.md)

```bash
npm start
```

[Add workspace](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

```bash
npm init -w ./packages/a
```

## Build

[esbuild](https://esbuild.github.io/getting-started/#bundling-for-the-browser)

## Publish

```bash
npm -w @erase2d/fabric version <type>
npm -w @erase2d/fabric publish
```
