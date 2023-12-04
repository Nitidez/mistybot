import { Command, Context, MistyBot } from '@/structures';

export default class Eval extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'eval',
            description: {
                content: 'Avaliar código.',
                examples: ['eval'],
                usage: 'eval',
            },
            category: 'dev',
            cooldown: 3,
            args: false,
            permissions: {
                dev: true,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<any> {
        const code = args.join(' ');
        const me = ctx.author
        const channel = ctx.channel
        const guild = ctx.guild
        const commands = client.commands
        const config = client.config

        const protectedEnv = ['DISCORD_TOKEN', 'LOGTAIL_SOURCE_TOKEN', 'DATABASE_URL', 'SHADOW_DATABASE_URL']

        try {
            let evaled = await eval(code);
            if (typeof evaled !== 'string') evaled = (await import('node:util')).inspect(evaled);
            protectedEnv.forEach((e) => {
                evaled = evaled.replace(`${process.env[e]}`, `process.env['${e}']`)
            })
            if (evaled.length > 1990) {
                const pastecord = new (require('pastecord'))()
                const paste = await pastecord.publish(evaled)
                ctx.sendMessage({content: `Sua avaliação excedeu o limite de caracteres do Discord, aqui está sua avaliação em pastecord:\n\n${paste.url}`})
                return;
            }
            ctx.sendMessage(`\`\`\`js\n${evaled}\n\`\`\``);
        } catch (e) {
            ctx.sendMessage(`\`\`\`js\n${e}\n\`\`\``);
        }
    }
}