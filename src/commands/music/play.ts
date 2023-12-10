import {MistyBot, Command, Context} from '@/structures'
import { AutocompleteInteraction, CacheType, GuildMember, User, VoiceChannel } from 'discord.js'
import { SearchResult } from 'lavalink-client';
import { utils } from '@/utils';
import moment from 'moment'

export default class Play extends Command {
    constructor(client: MistyBot) {
        super(client, {
            name: 'play',
            description: {
                content: 'Adicione uma música à fila.',
                usage: 'play',
                examples: ['play']
            },
            category: 'music',
            cooldown: 3,
            args: true,
            permissions: {
                dev: false,
                client: ['ViewChannel', 'SendMessages', 'Speak', 'Connect'],
                user: ['Connect', 'Speak']
            },
            slashCommand: true,
            options: [{
                name: 'query',
                description: 'Música para tocar.',
                type: 3,
                autocomplete: true,
                required: true
            }]
        })
    }

    public async run(client: MistyBot, ctx: Context, args: string[]): Promise<void> {
        const vcId = (ctx.member as GuildMember)?.voice?.channel?.id
        if (!vcId) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Você precisa se conectar à um canal de voz.`)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as any})
            .setTimestamp(Date.now())
        ]}) as any;
        const vc = (ctx.member as GuildMember)?.voice?.channel as VoiceChannel
        if (!vc.joinable || !vc.speakable) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Não tenho permissão para me conectar ou falar no canal de voz que você está conectado.`)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as any})
            .setTimestamp(Date.now())
        ]}) as any;

        const query = args.join(' ')
        if (query.startsWith('http://') || query.startsWith('https://')) {
            const quri = query.split(query.startsWith('http://') ? 'http://' : 'https://')[1]
            if (!quri.startsWith('open.spotify.com') && !quri.startsWith('soundcloud.com')) return ctx.sendMessage('Links são permitidos apenas do Spotify e Soundcloud') as any;
        }
        const player = client.lavalink.getPlayer((ctx.guild as any).id) || client.lavalink.createPlayer({
            guildId: (ctx.guild?.id as any),
            voiceChannelId: vcId,
            textChannelId: ctx.channelId,
            selfDeaf: true,
            selfMute: false,
            volume: client.defaultVolume,
            instaUpdateFiltersFix: true,
            applyVolumeAsFilter: false,
            vcRegion: (ctx.member as GuildMember)?.voice?.channel?.rtcRegion!,
            node: 'default'
        })

        if (player.connected && player.voiceChannelId !== vcId) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Você tem que estar no mesmo canal que estou tocando.`)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as any})
            .setTimestamp(Date.now() )
        ]}) as any;
        const res = await player.search({query: query}, {author: ctx.author, requested_date: Date.now()}) as SearchResult
        if (res.tracks.length === 0) return ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.red)
            .setTitle('Erro?!')
            .setDescription(`${client.misty_emojis.get('alerta')?.toString()} Nenhum resultado foi encontrado.`)
            .setFooter({text: `Requisitado por: ${ctx.author?.tag}`, iconURL: ctx.author?.avatarURL() as any})
            .setTimestamp(Date.now())
        ]}) as any;
        await player.queue.add(res.loadType === 'playlist' ? res.tracks : res.tracks[0])
        ctx.sendMessage({embeds: [
            client.embed()
            .setColor(client.color.green)
            .setTitle('Adicionado')
            .setDescription(`${client.misty_emojis.get('mais')?.toString()} Uma nova ${res.loadType === 'playlist' ? 'playlist' : 'música'} foi adicionada à fila.`)
            .setFooter(utils.requestedByFooter(ctx.author as User))
            .setTimestamp(Date.now())
            .setThumbnail(res.loadType === 'playlist' ? res.playlist?.thumbnail || '' : res.tracks[0].info.artworkUrl)
            .addFields(
                {
                    name: `${client.misty_emojis.get('caixa')?.toString()} Tipo`, 
                    value: res.loadType === 'playlist' ? 'Playlist' : 'Música'
                },
                {
                    name: `${client.misty_emojis.get('auditoria')?.toString()} Título`,
                    value: res.loadType === 'playlist' ? res.playlist?.title || 'Intitulado' : res.tracks[0].info.title
                },
                {
                    name: `${client.misty_emojis.get('calendario')?.toString()} ${res.loadType === 'playlist' ? 'Quantidade de Músicas' : 'Duração da Música'}`,
                    value: res.loadType === 'playlist' ? res.tracks.length.toString() : moment.utc(res.tracks[0].info.duration).format('m:ss'),
                },
                {
                    name: ' ',
                    value: ' '
                },
                {
                    name: `${client.misty_emojis.get('brokenurl')?.toString()} Link`,
                    value: res.loadType === 'playlist' ? res.playlist?.uri || 'Indefinido' : res.tracks[0].info.uri
                }
            )
        ]})

        if (!player.connected) player.connect();
        if (!player.playing) player.play({volume: client.config.defaultVolume});
    }

    public async autocomplete(client: MistyBot, interaction: AutocompleteInteraction): Promise<any> {
        if (!interaction.guildId) return;
        const vcId = (interaction.member as GuildMember)?.voice.channel?.id
        if (!vcId) return interaction.respond([{name: 'Conecte-se à um canal de voz.', value: 'vc_join'}]);
        const focused = interaction.options.getFocused()
        if (!focused) return interaction.respond([{name: 'Insira algum argumento.', value: 'insert_arg'}])
        if (focused.startsWith('http://') || focused.startsWith('http://')) {
            const url_focused = focused.split(' ')[0].split('http://')[0].split('https://')[0]
            const firstUrl = url_focused.split('/')[0]
            if (firstUrl !== 'open.spotify.com' && firstUrl !== 'soundcloud.com') {
                return interaction.respond([{name: 'Apenas Spotify e Soundcloud.', value: 'source_not_allowed'}]);
            }
        }
        const player = client.lavalink.getPlayer(interaction.guildId as string) || client.lavalink.createPlayer({
            guildId: interaction.guildId,
            voiceChannelId: vcId,
            textChannelId: interaction.channelId,
            instaUpdateFiltersFix: true,
            selfDeaf: true,
            selfMute: false,
            volume: client.defaultVolume
        })

        if (player.voiceChannelId !== vcId) return interaction.respond([{name: 'Entre no meu canal de voz.', value: 'join_myvc'}]);
        const res = await player.search({query: focused}, {author: interaction.user, requested_date: Date.now()})
        if (!res.tracks.length) return interaction.respond([{name: 'Nenhum resultado encontrado.', value: 'no_results'}]);
        if (res.loadType === 'playlist') return interaction.respond([{name: `Playlist [${res.tracks.length} Músicas] - ${res.playlist?.title}`, value: res.playlist?.uri as string}]);
        await interaction.respond(res.tracks.map((t) => ({
            name: `[${moment(t.info.duration).format('m:ss')}] ${t.info.title} (${t.info.author || 'Autor Desconhecido'})`,
            value: t.info.uri as string
        })))
    }
}