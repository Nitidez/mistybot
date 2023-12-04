import dotenv from "dotenv"
dotenv.config()

const {DISCORD_TOKEN, DISCORD_CLIENT_ID, LOGTAIL_SOURCE_TOKEN, DISCORD_SUPPORT_SERVER_ID, NODE_ENV} = process.env
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !LOGTAIL_SOURCE_TOKEN || !DISCORD_SUPPORT_SERVER_ID) {
    throw new Error("Missing environment variables.")
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_SUPPORT_SERVER_ID,
    LOGTAIL_SOURCE_TOKEN,
    color: {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
        main: 0x9933ff,
    },
    production: (NODE_ENV == 'production'),
    owners: [
        '837548133763907604'
    ],
    prefix: 'm!'
}