import { MistyBot, Command, Context } from "@/structures";
import { GuildMember } from "discord.js";

export default class Skip extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'skip',
            description: {
                content: 'Pula a música atual na fila!',
                usage: 'skip',
                examples: ['skip']
            },
            category: 'music',
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
                client: ['ViewChannel', 'SendMessages'],
                user: []
            },
            slashCommand: true,
            options: [{
                name: 'quantidade',
                description: 'Quantidade de músicas para pular.',
                type: 4
            }]
        })
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<any> {
        let amount = (!isNaN(parseFloat(args[0])) ? parseFloat(args[0]) : 1) || 1
        if (amount < 1) amount = 1;
        const player = client.lavalink.getPlayer((ctx.guild as any).id)
        const errorembed = client.embed()
        .setColor(client.color.red)
        .setTimestamp(Date.now())
        .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as string})
        .setTitle('Erro?!')
        if (!player || !player?.connected || !player?.playing) return ctx.sendMessage({embeds: [
            errorembed
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Eu não estou tocando música no momento.`)
        ]});

        const vc = (ctx.member as GuildMember).voice.channel
        if (!vc?.id || player.voiceChannelId !== vc?.id) return ctx.sendMessage({embeds: [
            errorembed
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Você precisa estar conectado em meu canal de voz.`)
        ]});

        if (player.queue.tracks.length < 1) return ctx.sendMessage({embeds: [
            errorembed
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Não há uma próxima música na fila, você pode optar por usar o comando stop.`)
        ]});

        if (player.queue.tracks.length > amount) amount = player.queue.tracks.length;

        await player.skip(amount)
        ctx.sendMessage({embeds: [
            client.embed()
            .setTimestamp(Date.now())
            .setColor(client.color.green)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as string})
            .setTitle('Pulado')
            .setDescription(`${amount} ${amount > 1 ? 'músicas foram puladas.' : 'música foi pulada.'} `)
        ]})
    }
}