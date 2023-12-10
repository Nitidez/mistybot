import dotenv from "dotenv"
dotenv.config()

const {DISCORD_TOKEN, DISCORD_CLIENT_ID, LOGTAIL_SOURCE_TOKEN, DISCORD_SUPPORT_SERVER_ID, NODE_ENV, LAVALINK} = process.env
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !LOGTAIL_SOURCE_TOKEN || !DISCORD_SUPPORT_SERVER_ID) {
    throw new Error("Missing environment variables.")
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_SUPPORT_SERVER_ID,
    LOGTAIL_SOURCE_TOKEN,
    LAVALINK: {
        address: LAVALINK?.split(':')[0] as string,
        port: parseFloat(LAVALINK?.split(':')[1].split('/')[0] as string) as number,
        password: LAVALINK?.split('/')[1] as string,
        secure: false
    },
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
    prefix: 'm!',
    defaultVolume: 100,
    emojis: {
        alerta: '1123697989400150017',
        caixa: '1123697503364198410',
        auditoria: '1123698389918416906',
        calendario: '1123697244630159550',
        brokenurl: '914540739956981851',
        mais: '1123697743555215390'
    }
}