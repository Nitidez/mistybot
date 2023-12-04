import { MistyBot, Event } from "@/structures";

export default class Ready extends Event {
    constructor(client: MistyBot, file: string) {
        super(client, file, {
            name: 'ready'
        })
    }

    public async run(): Promise<void> {
        this.client.logger.info('Client is ready.')
    }
}