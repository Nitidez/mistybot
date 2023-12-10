import { MistyBot, Command, Context } from "@/structures";
import { AutocompleteInteraction, CacheType } from "discord.js";

export default class Emoji extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'emoji',
            description: {
                content: 'Funções de emoji do servidor!',
            } as any,
            category: 'util',
            cooldown: 3,
            args: true,
            permissions: {
                dev: false,
                client: ['ViewChannel', 'SendMessages', 'ManageEmojisAndStickers'],
                user: ['ManageEmojisAndStickers']
            },
            slashCommand: true,
            options: [
                {
                    name: 'adicionar',
                    description: 'Adiciona um emoji.',
                    type: 1,
                    options: [
                        {
                            name: 'url',
                            description: 'Link da imagem.',
                            type: 3,
                            required: true
                        }
                    ]
                },
                {
                    name: 'deletar',
                    description: 'Deleta um emoji.',
                    type: 1,
                    options: [
                        {
                            name: 'emoji',
                            description: 'Emoji escolhido',
                            required: true,
                            autocomplete: true,
                            type: 3
                        }
                    ]
                }
            ]
        })
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<any> {
        ctx.sendMessage(args.toString())
    }
    public async autocomplete(client: MistyBot, interaction: AutocompleteInteraction): Promise<any> {
        interaction.respond([{name: 'test', value: 'test'}])
    }
}