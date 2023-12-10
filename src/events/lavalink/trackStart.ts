import { MistyBot, Event } from "@/structures";
import { TextChannel } from "discord.js";
import { Player, Track, TrackStartEvent } from "lavalink-client";
import moment from "moment";

export default class trackStart extends Event {
    constructor(client: MistyBot, file: string) {
        super(client, file, {
            name: 'trackStart'
        })
    }

    public async run(player: Player, track: Track, payload: TrackStartEvent): Promise<any> {
        const channel = await this.client.channels.fetch(player.textChannelId as string) as TextChannel
        channel.send({embeds: [
            this.client.embed()
            .setColor(this.client.color.blue)
            .setTitle('Tocando')
            .setDescription(`${this.client.misty_emojis.get('auditoria')?.toString()} Agora está tocando **${track.info.title}** \`(${moment.utc(track.info.duration).format('m:ss')})\``)
            .setFooter({text: `Solicitada por: ${(track.requester as any)?.author?.tag}`, iconURL: (track.requester as any)?.author?.avatarURL()})
            .setTimestamp((track.requester as any)?.requested_date)
            .setThumbnail(track.info.artworkUrl)
        ]})
    }
}