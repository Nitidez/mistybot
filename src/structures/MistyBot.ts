import { Client, ClientOptions, Collection, EmbedBuilder, ApplicationCommandType, Routes, PermissionsBitField, REST, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { PrismaClient } from '@prisma/client'
import { config } from "@/config";
import logger from "@/utils/logger";
import fs from 'fs'
import path from 'path'

export default class MistyBot extends Client {
    public commands: Collection<string, any> = new Collection()
    public cooldown: Collection<string, any> = new Collection() 
    public config = config
    public logger = logger
    public readonly color = config.color
    private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    public prisma = new PrismaClient()

    public constructor(options: ClientOptions) {
        super(options)
    }

    public embed(): EmbedBuilder {
        return new EmbedBuilder();
    }

    public async start(token: string): Promise<void> {
        this.logger.info('MistyBot starting...')
        this.loadCommands()
        this.logger.info('Commands loaded!')
        this.loadEvents()
        this.logger.info('Events loaded!')
        this.prisma.$connect().then(() => {
            this.logger.info('Database connected!')
        }).catch((err: any) => {
            this.logger.error('Unable to connect to the database.')
            this.logger.error(err)
        });
        await this.login(token)
    }

    private loadCommands(): void {
        const commandsPath = fs.readdirSync(path.join(__dirname, '../commands'));
        commandsPath.forEach(dir => {
            const commandFiles = fs
                .readdirSync(path.join(__dirname, `../commands/${dir}`))
                .filter(file => (file.endsWith('.js') || file.endsWith('.ts')));
            commandFiles.forEach(async file => {
                const cmd = (await import(`../commands/${dir}/${file}`)).default;
                const command = new cmd(this);
                command.category = dir;
                this.commands.set(command.name, command);
                if (command.slashCommand) {
                    const data = {
                        name: command.name,
                        description: command.description.content,
                        type: ApplicationCommandType.ChatInput,
                        options: command.options ? command.options : null,
                        name_localizations: command.nameLocalizations
                            ? command.nameLocalizations
                            : null,
                        description_localizations: command.descriptionLocalizations
                            ? command.descriptionLocalizations
                            : null,
                        default_member_permissions:
                            command.permissions.user.length > 0 ? command.permissions.user : null,
                    };
                    if (command.permissions.user.length > 0) {
                        const permissionValue = PermissionsBitField.resolve(
                            command.permissions.user
                        );
                        if (typeof permissionValue === 'bigint') {
                            data.default_member_permissions = permissionValue.toString();
                        } else {
                            data.default_member_permissions = permissionValue;
                        }
                    }
                    const json = JSON.stringify(data);
                    this.body.push(JSON.parse(json));
                }
            });
        });
        this.once('ready', async () => {
            const applicationCommands =
                this.config.production === true
                    ? Routes.applicationCommands(this.config.DISCORD_CLIENT_ID ?? '')
                    : Routes.applicationGuildCommands(
                          this.config.DISCORD_CLIENT_ID ?? '',
                          this.config.DISCORD_SUPPORT_SERVER_ID ?? ''
                      );
            try {
                const rest = new REST({ version: '9' }).setToken(this.config.DISCORD_TOKEN ?? '');
                await rest.put(applicationCommands, { body: this.body });
                this.logger.info('SlashCommands Inserted!')
            } catch (error) {
                this.logger.error(error);
            }
        });
    }

    private loadEvents(): void {
        const eventspath = fs.readdirSync(path.join(__dirname, '../events'))
        eventspath.forEach(dir => {
            const events = fs.readdirSync(path.join(__dirname, `../events/${dir}`)).filter(file => (file.endsWith('.js') || file.endsWith('.ts')))
            events.forEach(async (file) => {
                const event = (await import(`@/events/${dir}/${file}`)).default;
                const evt = new event(this, file)

                switch (dir) {
                    default:
                        this.on(evt.name, (...args) => evt.run(...args))
                    break;
                }
            })
        })
    }
}