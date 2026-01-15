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
npm run dev
```

[Add workspace](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

```bash
npm init -w ./packages/a
```

## Publish

```bash
npm run prepublish
npm -w @erase2d/fabric version <type>
npm -w @erase2d/fabric publish
```

## Sponsors

<table>
  <tr>
    <td>
      <a
        href="https://rembg.com/?utm_source=erase2d&utm_medium=github_readme&utm_campaign=sponsorship"
      >
        <img
          width="120px"
          height="120px"
          alt="RemBG.com Logo"
          src="https://github.com/user-attachments/assets/25433a27-5758-4c02-8375-649acde37556"
        />
      </a>
    </td>
    <td>
      <b>RemBG Remove Background API</b>
      <br />
      <a
        href="https://rembg.com/?utm_source=erase2d&utm_medium=github_readme&utm_campaign=sponsorship"
        >https://rembg.com</a
      >
      <br />
      <p width="200px">
        Accurate and affordable background remover API
        <br />
      </p>
    </td>
  </tr>
</table>
