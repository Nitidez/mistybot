import { MistyBot, Command, Context } from "@/structures";
import { CacheType, GuildMember } from "discord.js";

export default class Stop extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'stop',
            description: {
                content: 'Pare de tocar músicas!',
                usage: 'stop',
                examples: ['stop']
            },
            category: 'music',
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
                client: ['ViewChannel', 'SendMessages', 'Speak', 'Connect'],
                user: ['Speak', 'Connect']
            },
            slashCommand: true,
            options: []
        })
    }

    public async run(client: MistyBot, ctx: Context): Promise<any> {
        const errorembed = client.embed()
        .setColor(client.color.red)
        .setTimestamp(Date.now())
        .setTitle('Erro?!')
        .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as string})

        const player = client.lavalink.getPlayer(ctx.guild?.id as string)
        if (!player) return ctx.sendMessage({embeds: [
            errorembed
            .setDescription(`${client.misty_emojis.get('alerta')} Eu não estou tocando música no momento.`)
        ]});

        const vc = (ctx.member as GuildMember)?.voice.channel
        if (!vc?.id || player.voiceChannelId !== vc?.id) return ctx.sendMessage({embeds: [
            errorembed
            .setDescription(`${client.misty_emojis.get('alerta')} Você precisa estar conectado em meu canal de voz.`)
        ]});

        player.stopPlaying()
        player.destroy('stop_command')
        ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.green)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as string})
            .setTimestamp(Date.now())
            .setTitle('Parado')
            .setDescription(`As músicas pararam e foram limpas da fila.`)
        ]})
    }
}