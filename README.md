# [QUICKSTART]

Project Northstar

Note: The steps below assume you have a working WebEx account &
**[Nodejs](https://nodejs.org/en/download/)** 16.7+

# Bot Setup

## 1) Fetch repo & install deps

```
git clone https://github.com/valgaze/project-northstar
cd project-northstar
npm i
```

## 2) Set your bot access token

- If you have an existing bot, get its token here:
  **[https://developer.webex.com/my-apps](https://developer.webex.com/my-apps)**

- If you don't have a bot, create one and save the token from here:
  **[https://developer.webex.com/my-apps/new/bot](https://developer.webex.com/my-apps/new/bot)**

- Copy the file **[.env.example](.env.example)** as `.env` in the root of your
  project and save your access token under the `BOT_TOKEN` field.

## 3) Boot

You can boot a local version using

```
npm run dev
```

To deploy, go to **[worker-deploy]** & run `npm run deploy`

**See
[example here](https://github.com/valgaze/speedybot-mini/tree/deploy/examples/worker)**

## 4) Build your agent

- The only file you need to think about is
  **[settings/config.ts](./settings/config.ts)**

- **[📚 API Docs](https://github.com/valgaze/speedybot-mini/blob/deploy/api-docs/modules.md#classes)**

## Boot

- `npm run dev`: Boot with reload on code changes
- `npm run reset`: If you encounter an issue with "too may device registrations"
  when using live-reload run this command-- wait a few minutes after running
  before reattempting websockets
