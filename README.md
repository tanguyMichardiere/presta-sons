# Presta'sons

## Environment variables

See [env.ts](src/env.ts)

Required:

```bash
# the bot's client ID
APPLICATION_ID=""
# the bot's client secret
DISCORD_TOKEN=""

# the ID of the server the bot will monitor
GUILD_ID=""
# the ID of the text or forum channel the bot will monitor
FORUM_ID=""
```

Optional:

```bash
# "fatal", "error", "warn", "info", "debug", "trace" or "silent"
LOG_LEVEL=""  # default: "info"

# the prefix for the roles that the bot will consider to categorize members
ROLE_PREFIX=""  # default: "ps "
```

## Requirements

- [Node.js](https://nodejs.org) (version ^20)
- [Discord](https://discord.com)
- [VSCode](https://code.visualstudio.com) (optional but recommended)

## Local development

- Enable "Developer Mode" in Discord > Settings > App Settings > Advanced
- Create a new Discord server or use an existing one
- Create a text or forum channel or use an existing one
- Create a Discord Application:
  - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
  - Click `New Application`, choose a name and confirm
  - Navigate to Bot and switch on "Server Members Intent" under Privileged Gateway Intents (required to be able to list the server members)
  - Navigate to OAuth2 > URL Generator, check the "bot" scope then open the URL below in a browser to invite the bot in your Discord server
- Clone this repository
- Create your env file:
  - Copy `.env` to `.env.local`
  - Set the required environment variables:
    - `APPLICATION_ID`: on the Developer Portal, in General Information, click "Copy" under Application ID
    - `DISCORD_TOKEN`: on the Developer Portal, in Bot, click "Reset Token", confirm, then click "Copy"
    - `GUILD_ID`: right-click on your Discord server then click "Copy Server ID"
    - `FORUM_ID`: right-click on your text or forum channel then click "Copy Channel ID"
- `npm install`
- `npm run dev`

If it starts successfully, the bot will log a "READY" message with informations on your server and the forum channel.

### Static analysis

All these checks run in CI and prevent a merge to the production branch, please run them before committing your code:

```bash
npm run check-format  # fix: npm run format
npm run lint  # try to fix: npm run lint -- --fix
npm run check-types
npm run check-dead-code
```

## Deployment

Use the provided [Dockerfile](Dockerfile)
