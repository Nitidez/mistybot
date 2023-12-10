import { MistyBot, Command, Context } from "@/structures";
import { utils } from "@/utils";
import { User } from "discord.js";

export default class Pause extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'pause',
            description: {
                content: 'Pause a música.',
                examples: ['pause'],
                usage: 'pause',
            },
            args: false,
            category: 'music',
            cooldown: 3,
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'Speak', 'Connect'],
                user: ['Speak', 'Connect']
            },
            slashCommand: true,
            options: []
        })
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<any> {
        const player = client.lavalink.getPlayer(ctx.guild?.id as string) 

        if (!player || !player?.connected) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTimestamp(Date.now())
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Não estou tocando música para que seja pausada.`)
        ]});

        const paused = player.paused

        if (paused) {
            try {await player.resume()} catch(e) {}
        } else {
            try {await player.pause()} catch(e) {}
        }

        ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.green)
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTimestamp(Date.now()) 
            .setTitle(paused ? 'Retomada' : 'Pausada')
            .setDescription(`A música foi ${paused ? 'retomada' : 'pausada'}.`)
        ]})
    }
}