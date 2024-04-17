# [Erase2d](https://shaman123.github.io/erase2d/)

A simple erasing tool.

Currently supports [fabric](./packages/fabric/README.md) out of the box.

The plan is to expose more bindings.
Contributions are welcome, ping me in a feature request.

## Dev

Start the [app](./packages/app/README.md)

```bash
npm run build -w @erase2d/core -- -w
npm run build -w @erase2d/fabric -- -w
npm start
```

[Add workspace](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

```bash
npm init -w ./packages/a
```

## Publish

```bash
npm -w @erase2d/fabric version <type>
npm -w @erase2d/fabric publish
```
