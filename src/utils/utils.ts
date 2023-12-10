import { EmbedFooterOptions, User } from "discord.js";

function requestedByFooter(user: User): EmbedFooterOptions {
    return {
        text: `Requisitado por: ${user.tag}`,
        iconURL: user.avatarURL() as string
    }
}

export default {requestedByFooter}