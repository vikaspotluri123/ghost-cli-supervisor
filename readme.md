# ghost-cli-supervisor

Ghost CLI process manager that uses supervisor to run Ghost. Heavily influenced by [ghost-cli-pm2](https://github.com/acburdine/ghost-cli-pm2/) and [ghost-cli (systemd)](https://github.com/TryGhost/Ghost-CLI/tree/79100ee52456ab2b2bb0b6dc826e239b415d6ad7/extensions/systemd)

## Installation

```sh
npm i -g ghost-cli ghost-cli-supervisor

ghost install --process supervisor
```

**Note: installing ghost-cli-supervisor via yarn global add won't work correctly - Ghost-CLI currently doesn't support loading extensions via yarn.**
