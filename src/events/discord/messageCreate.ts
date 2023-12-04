import { ChannelType, Collection, Message, PermissionFlagsBits } from 'discord.js';

import { Context, Event, MistyBot } from '@/structures';

export default class MessageCreate extends Event {
    constructor(client: MistyBot, file: string) {
        super(client, file, {
            name: 'messageCreate',
        });
    }
    public async run(message: Message): Promise<any> {
        if (message.author.bot) return;
        let prefix = (await this.client.prisma.guild.findUnique({
            where: {
                guildId: message.guildId || '0',
            },
        })) as any;
        if (!prefix) {
            prefix = this.client.config.prefix;
        } else {
            prefix = prefix.prefix;
        }
        const mention = new RegExp(`^<@!?${this.client.user?.id}>( |)$`);
        if (message.content.match(mention)) {
            await message.reply({
                content: `Olá, meu prefixo neste servidor é \`${prefix}\` Quer mais informações? Use \`${prefix}help\``,
            });
            return;
        }
        const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(`^(<@!?${this.client.user?.id}>|${escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        const [matchedPrefix] = (message.content.match(prefixRegex) as any);

        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);

        const cmd = args.shift()?.toLowerCase();
        const command =
            this.client.commands.get(cmd as any)
        if (!command) return;
        const ctx = new Context(message, args);
        ctx.setArgs(args);

        let dm = message.author.dmChannel;
        if (typeof dm === 'undefined') dm = await message.author.createDM();

        if (
            !message.inGuild() ||
            !message.channel
                .permissionsFor(message.guild.members.me as any)
                .has(PermissionFlagsBits.ViewChannel)
        )
            return;

        if (!(message.guild.members.me as any).permissions.has(PermissionFlagsBits.SendMessages))
            return await message.author
                .send({
                    content: `Eu não tenho a permissão **\`Enviar Mensagens\`** em \`${message.guild.name}\`\nno canal: <#${message.channelId}>`,
                })
                .catch(() => {});

        if (command.permissions) {
            if (command.permissions.client) {
                if (!(message.guild.members.me as any).permissions.has(command.permissions.client))
                    return await message.reply({
                        content: 'Eu não tenho as devidas permissões para realizar este comando.',
                    });
            }

            if (command.permissions.user) {
                if (!message.member?.permissions.has(command.permissions.user))
                    return await message.reply({
                        content: 'Você não tem permissão para utilizar este comando.',
                    });
            }
            if (command.permissions.dev) {
                if (this.client.config.owners) {
                    const findDev = this.client.config.owners.find(x => x === message.author.id);
                    if (!findDev) return;
                }
            }
        }
        if (command.args) {
            if (!args.length) {
                const embed = this.client
                    .embed()
                    .setColor(this.client.color.red)
                    .setTitle('Faltam parâmetros.')
                    .setDescription(
                        `Especifique os parâmetros suficientes do comando \`${
                            command.name
                        }\`.\n\nExemplos:\n${
                            command.description.examples
                                ? command.description.examples.join('\n')
                                : 'Nenhum'
                        }`
                    )
                    .setFooter({ text: 'Sintaxe: [] = opcional, <> = obrigatório' });
                return await message.reply({ embeds: [embed] });
            }
        }

        if (!this.client.cooldown.has(cmd as any)) {
            this.client.cooldown.set(cmd as any, new Collection());
        }
        const now = Date.now();
        const timestamps = this.client.cooldown.get(cmd as any);

        const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            const timeLeft = (expirationTime - now) / 1000;
            if (now < expirationTime && timeLeft > 0.9) {
                return await message.reply({
                    content: `Espere ${timeLeft.toFixed(
                        1
                    )} segundos antes de reusar o comando \`${cmd}\`.`,
                });
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }
        if (args.includes('@everyone') || args.includes('@here'))
            return await message.reply({
                content: 'Você não pode usar here e everyone aqui.',
            });

        try {
            return command.run(this.client, ctx, ctx.args);
        } catch (error) {
            this.client.logger.error(error);
            await message.reply({ content: `Um erro ocorreu: \`${error}\`` });
            return;
        }
    }
}