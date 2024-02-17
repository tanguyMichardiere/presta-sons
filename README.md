# Presta'sons

## Environment variables

See [env.ts](src/env.ts)

Required:

```bash
# the bot's client secret
DISCORD_TOKEN=""
```

Optional:

```bash
# "fatal", "error", "warn", "info", "debug", "trace" or "silent"
LOG_LEVEL=""  # default: "info"

# a server ID to optionally limit the scope of the bot to it (makes deploying commands much faster)
GUILD_ID=""
# the prefix for the roles that the bot will use to categorize members
ROLE_PREFIX=""  # default: "ps "
# the name of the role that is allowed to create surveys and request tag messages
ADMIN_ROLE_NAME=""  # default: "Admin Presta'sons"
```

## Requirements

- [Bun](https://bun.sh) (version ^1.0.0)
- [Discord](https://discord.com)
- [VSCode](https://code.visualstudio.com) (optional but recommended)

## Local development

- Create a Discord Application:
  - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
  - Click "New Application", choose a name and confirm
  - Navigate to Bot and switch on "Server Members Intent" under Privileged Gateway Intents (required to be able to list the server members)
  - Navigate to OAuth2 > URL Generator, check the "bot" scope and the "Read Messages/View Channels", "Send Messages", "Send Messages in Threads", "Manage Messages", "Embed Links" and "Read Message History" permissions, then open the URL below in a browser to invite the bot in your Discord server (the URL should be: `https://discord.com/api/oauth2/authorize?client_id=[the bot's application ID]&permissions=274878000128&scope=bot`)
- Clone this repository
- Create your env file:
  - Copy `.env` to `.env.local`
  - Set the required environment variables:
    - `DISCORD_TOKEN`: on the Developer Portal, in Bot, click "Reset Token", confirm, then click "Copy"
- `bun install`
- `bun run dev`

If it starts successfully, the bot will log a "READY" message with informations on your server.

### Static analysis and tests

All these checks run in CI and prevent a merge to the production branch, please run them before committing your code:

```bash
bun run check-format  # fix: bun run format
bun run lint  # try to fix: bun run lint --fix
bun run check-types
bun run check-dead-code
bun test
```

## Deployment

Use the provided [Dockerfile](Dockerfile)
