import { MistyBot, Command, Context } from "@/structures";

export default class Ping extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'ping',
            description: {
                content: 'Mostra o ping do bot!',
                usage: 'ping',
                examples: ['ping']
            },
            category: 'general',
            cooldown: 3,
            args: false,
            permissions: {
                dev: false,
                client: ['ViewChannel', 'SendMessages'],
                user: []
            },
            slashCommand: true,
            options: []
        })
    }

    public async run(client: MistyBot, ctx: Context): Promise<any> {
        const msg = await ctx.sendDeferMessage('Pinging...')
        const embed = client
          .embed()
          .setAuthor({name: 'Pong!', iconURL: this.client.user?.displayAvatarURL()})
          .setColor(this.client.color.main)
          .addFields([
            {
                name: 'Latência',
                value: `\`\`\`ini\n[ ${
                    msg.createdTimestamp - ctx.createdTimestamp
                }ms ]\n\`\`\``,
                inline: true
            },
            {
                name: 'Latência da API',
                value: `\`\`\`ini\n[${Math.round(ctx.client.ws.ping)}ms]\n\`\`\``,
                inline: true
            }
          ])
          .setFooter({
            text: `Requisitado por ${ctx.author?.tag}`,
            iconURL: (ctx.author as null as any).avatarURL({})
          })
          .setTimestamp(Date.now())

          return await ctx.editMessage({content: '', embeds: [embed]})
    }
}