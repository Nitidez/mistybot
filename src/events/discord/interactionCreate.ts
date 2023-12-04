import {
    AutocompleteInteraction,
    ChannelType,
    Collection,
    CommandInteraction,
    GuildMember,
    InteractionType,
    PermissionFlagsBits,
} from 'discord.js';
import { MistyBot, Event, Context } from "@/structures";

export default class Ready extends Event {
    constructor(client: MistyBot, file: string) {
        super(client, file, {
            name: 'interactionCreate'
        })
    }

    public async run(interaction: CommandInteraction | AutocompleteInteraction): Promise<void> {
        if (interaction instanceof CommandInteraction && interaction.type === InteractionType.ApplicationCommand) {
            const {commandName} = interaction
            const command = this.client.commands.get(commandName)
            if (!command) return;
            const ctx = new Context(interaction as any, interaction.options.data as any);
            ctx.setArgs(interaction.options.data as any)

            if (
                !interaction.inGuild() ||
                !interaction.channel?.permissionsFor((interaction.guild as any)?.members.me)?.has(PermissionFlagsBits.ViewChannel)
            ) return;
            if (!(interaction.guild?.members.me as any).permissions.has(PermissionFlagsBits.SendMessages)) {
                return await ((interaction.member as GuildMember)
                    .send({
                        content: `Eu não tenho a permissão **\`Enviar Mensagens\`** em \`${(interaction.guild as any).name}\`\n no canal: <#${interaction.channelId}>`,
                    })
                    .catch(() => {}) as any);
            }

            if (command.permissions) {
                if (command.permissions.client) {
                    if (!(interaction.guild?.members.me as any).permissions.has(command.permissions.client))
                        return (await interaction.reply({
                            content: 'Eu não tenho as devidas permissões para este comando.',
                        }) as any);
                }

                if (command.permissions.user) {
                    if (
                        !(interaction.member as GuildMember).permissions.has(
                            command.permissions.user
                        )
                    ) {
                        await interaction.reply({
                            content: 'Você não tem permissão para usar este comando.',
                            ephemeral: true,
                        });
                        return;
                    }
                }
                if (command.permissions.dev) {
                    if (this.client.config.owners) {
                        const findDev = this.client.config.owners.find(
                            x => x === interaction.user.id
                        );
                        if (!findDev) return;
                    }
                }
            }

            if (!this.client.cooldown.has(commandName)) {
                this.client.cooldown.set(commandName, new Collection());
            }
            const now = Date.now();
            const timestamps = this.client.cooldown.get(commandName);

            const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;
            if (!timestamps.has(interaction.user.id)) {
                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            } else {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                const timeLeft = (expirationTime - now) / 1000;
                if (now < expirationTime && timeLeft > 0.9) {
                    return (await interaction.reply({
                        content: `Espere ${timeLeft.toFixed(
                            1
                        )} segundos antes de reusar o comando \`${commandName}\`.`,
                    }) as any);
                }
                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            }
            if (
                interaction.options.data.some(option =>
                    option.value && option.value.toString().includes('@everyone')
                ) ||
                interaction.options.data.some(option => option.value && option.value.toString().includes('@here'))
            )
                return (await interaction.reply({
                    content: 'Você não pode mencionar here ou everyone aqui.',
                    ephemeral: true,
                }) as any);
            try {
                await command.run(this.client, ctx, ctx.args);
            } catch (error) {
                this.client.logger.error(error);
                await interaction.reply({ content: `Um erro ocorreu: \`${error}\`` });
            }
        }
    }
}