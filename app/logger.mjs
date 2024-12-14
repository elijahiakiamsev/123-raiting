import winston from 'winston';

let alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
      all:true
  }),
  winston.format.label({
      label:'[LOGGER]'
  }),
  winston.format.timestamp({
      format:"YY-MM-DD HH:mm:ss"
  }),
  winston.format.printf(
      info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

export const logger = winston.createLogger({
    level:'debug',
    format: winston.format.combine(
        winston.format.errors({stack:true}),
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize(),
        alignColorsAndTime
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });
