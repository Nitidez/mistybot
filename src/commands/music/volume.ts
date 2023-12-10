import { MistyBot, Command, Context } from "@/structures";
import { ApplicationCommandOptionType, User } from "discord.js";
import { utils } from "@/utils";

export default class Volume extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'volume',
            description: {
                content: 'Altera o volume da música.',
                examples: ['volume'],
                usage: 'volume'
            },
            args: true,
            category: 'music',
            cooldown: 3,
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'Connect', 'Speak'],
                user: ['Connect', 'Speak']
            },
            slashCommand: true,
            options: [
                {
                    name: 'quantidade',
                    description: 'O volume desejado.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        })
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<any> {
        const player = client.lavalink.getPlayer(ctx.guild?.id as string)
        if (!player || !player?.connected) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Eu não estou tocando música para você alterar o volume.`)
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTimestamp(Date.now())
        ]});

        if (isNaN(parseFloat(args[0].split('%')[0]))) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Você não providenciou um número valido como: '**100**%', '**30**%', etc...`)
            .setTimestamp(Date.now())
            .setFooter(utils.requestedByFooter(ctx.author as User))
        ]});

        let vol = parseFloat(args[0].split('%')[0])
        if (vol < 0) vol = 0;
        if (vol > 100) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTimestamp(Date.now())
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} O limite normal é de 100%, em servidores premium o limite é de 200%.`)
        ]});
        player.setVolume(vol)
        ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.green)
            .setTimestamp(Date.now())
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTitle('Volume alterado')
            .setDescription(`Volume alterado para **${vol}%**.`)
        ]})
    }
}