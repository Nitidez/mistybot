import MistyBot from "@/structures/MistyBot"

export default class Event {
    public client: MistyBot;
    public file: string;
    public name: string;
    public fileName: string;

    constructor(client: MistyBot, file: string, options: EventOptions) {
        this.client = client
        this.file = file
        this.name = options.name
        this.fileName = file.split('.')[0]
    }

    public async run(...args: any[]): Promise<any> {
        return await Promise.resolve()
    }
}

export interface EventOptions {
    name: string
}