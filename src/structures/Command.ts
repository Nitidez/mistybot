import { ApplicationCommandOption, PermissionResolvable } from "discord.js";
import {MistyBot} from "@/structures";

export default class Command {
    public client: MistyBot;
    public name: string;
    public description: {
        content: string | null;
        usage: string | null;
        examples: string[] | null; 
    };
    public cooldown: number;
    public args: boolean;
    public permissions: {
        dev: boolean;
        client: string[] | PermissionResolvable;
        user: string[] | PermissionResolvable;
    }
    public slashCommand: boolean; 
    public options: ApplicationCommandOption[];
    public category: string | null; 

    constructor(client: MistyBot, options: CommandOptions) {
        this.client = client
        this.name = options.name
        this.description = {
            content: options.description ? options.description.content || 'Nenhuma descrição fornecida.' : 'Nenhuma descrição fornecida.',
            usage: options.description ? options.description.usage || 'Nenhum uso fornecido.' : 'Nenhuma uso fornecido.',
            examples: options.description ? options.description.examples || ['Nenhum exemplo fornecido.'] : ['Nenhuma exemplo fornecido.']
        };
        this.cooldown = options.cooldown || 3;
        this.args = options.args || false;
        this.permissions = {
            dev: options.permissions ? options.permissions.dev || false : false,
            client: options.permissions ? options.permissions.client || [] : ['SendMessages', 'ViewChannel', 'EmbedLinks'],
            user: options.permissions ? options.permissions.user || [] : []
        };
        this.slashCommand = options.slashCommand || false;
        this.options = options.options || [];
        this.category = options.category || 'general';
    }

        public async run(_client: MistyBot, _message: any, _args: string[]): Promise<any> {
            return await Promise.resolve()
    }

}

interface CommandOptions {
    name: string;
    description?: {
        content: string;
        usage: string;
        examples: string[];
    };
    aliases?: string[];
    cooldown?: number;
    args?: boolean;
    player?: {
        voice: boolean;
        dj: boolean;
        active: boolean;
        djPerm: string | null;
    };
    permissions?: {
        dev: boolean;
        client: string[] | PermissionResolvable;
        user: string[] | PermissionResolvable;
    };
    slashCommand?: boolean;
    options?: ApplicationCommandOption[];
    category?: string;
}