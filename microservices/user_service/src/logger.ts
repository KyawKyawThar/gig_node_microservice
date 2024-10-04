import winston, { Logger } from 'winston';
import { ElasticsearchTransformer, ElasticsearchTransport, LogData, TransformedData } from 'winston-elasticsearch';

const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData);
};

export const winstonLogger = (elasticSearchNode: string, name: string, level: string): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: true,
      colorize: true
    },
    elasticSearch: {
      level,
      transformer: esTransformer,
      clientOpts: {
        node: elasticSearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 1000,
        sniffOnStart: false
      }
    }
  };
  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticSearch);

  const errorLogFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

  const infoLogFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
  const infoOnlyFilter = winston.format((info) => {
    return info.level === 'info' ? info : false;
  });

  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },

    transports: [
      new winston.transports.Console(options.console),
      new winston.transports.File({
        filename: './src/log/auth-service-error.log',
        level: 'error', // Log errors only
        format: errorLogFormat
      }),
      new winston.transports.File({
        filename: './src/log/auth-service-info.log',
        format: winston.format.combine(infoOnlyFilter(), infoLogFormat)
      }),
      esTransport
    ]
  });
  return logger;
};
