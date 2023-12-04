import {createLogger, transports, format} from "winston";
import {Logtail} from '@logtail/node'
import {LogtailTransport} from '@logtail/winston'
import {config} from '@/config'

const logtail = new Logtail(config.LOGTAIL_SOURCE_TOKEN)

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'app.log'
        }),
        new LogtailTransport(logtail)

    ]
})

export default logger