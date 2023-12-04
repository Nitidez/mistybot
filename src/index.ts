import { config } from "@/config";
import MistyBot from '@/structures/MistyBot'

const client = new MistyBot({
    intents: [
        "Guilds",
        "GuildMessages",
        "DirectMessages",
        "MessageContent"
    ]
});

(async () => await client.start(config.DISCORD_TOKEN))()

export {client}