import { Client, ClientOptions, Collection, EmbedBuilder, ApplicationCommandType, Routes, PermissionsBitField, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, ApplicationCommandData, GuildEmoji } from "discord.js";
import { PrismaClient } from '@prisma/client'
import { config } from "@/config";
import {logger} from "@/utils";
import fs from 'fs'
import path from 'path'
import { LavalinkManager } from "lavalink-client";

export default class MistyBot extends Client {
    public commands: Collection<string, any> = new Collection()
    public cooldown: Collection<string, any> = new Collection() 
    public misty_emojis: Collection<keyof typeof config.emojis, GuildEmoji> = new Collection();
    public config = config
    public logger = logger
    public readonly color = config.color
    private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    public prisma = new PrismaClient()
    public defaultVolume = config.defaultVolume
    public lavalink = new LavalinkManager({
        nodes: [
            {
                authorization: config.LAVALINK.password,
                host: config.LAVALINK.address,
                port: config.LAVALINK.port,
                id: 'default',
                requestTimeout: 10000,
                secure: config.LAVALINK.secure
            }
        ],
        sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
        client: {
            id: config.DISCORD_CLIENT_ID,
            username: 'MistyBot'
        },
        autoSkip: true,
        playerOptions: {
            clientBasedPositionUpdateInterval: 150,
            defaultSearchPlatform: "spotify",
            volumeDecrementer: 0.75,
            onDisconnect: {
                autoReconnect: true,
                destroyPlayer: false
            },
            onEmptyQueue: {
                destroyAfterMs: 30_000
            }
        },
        queueOptions: {
            maxPreviousTracks: 25
        }
    })

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
        this.on('raw', d => {
            this.lavalink.sendRawData(d)
        })
        await this.login(token)
        this.loadMistyEmojis()
    }

    private loadMistyEmojis(): void {
        this.once('ready', () => {
            for(const [k, v] of Object.entries(config.emojis)) {
                const emj = this.emojis.cache.get(v)
                this.misty_emojis.set(k as any, emj as any)
            }
        })
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
                    const data: ApplicationCommandData = {
                        name: command.name,
                        description: command.description.content,
                        type: ApplicationCommandType.ChatInput,
                        options: command.options ? command.options : null,
                        defaultMemberPermissions: command.permissions.user.length > 0 ? command.permissions.user : null
                    };
                    if (command.permissions.user.length > 0) {
                        const permissionValue = PermissionsBitField.resolve(
                            command.permissions.user
                        );
                        if (typeof permissionValue === 'bigint') {
                            data.defaultMemberPermissions = permissionValue.toString() as any;
                        } else {
                            data.defaultMemberPermissions = permissionValue;
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
                    case 'lavalink':
                        this.lavalink.on(evt.name, (...args: any) => evt.run(...args))
                    break;
                    default:
                        this.on(evt.name, (...args) => evt.run(...args))
                    break;
                }
            })
        })
    }
}