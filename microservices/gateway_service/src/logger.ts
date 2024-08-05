import winston, { Logger } from 'winston';
import { ElasticsearchTransformer, ElasticsearchTransport, LogData, TransformedData } from 'winston-elasticsearch';

// Custom log levels
const customLevels = {
  levels: {
    success: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    success: 'green',
    info: 'blue',
    warn: 'yellow',
    error: 'red'
  }
};

const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData);
};

export const winstonLogger = (elasticsearchNode: string, name: string, level: string): Logger => {
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
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false
      }
    }
  };
  // Add custom levels and colors to Winston
  winston.addColors(customLevels.colors);

  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticSearch);
  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [new winston.transports.Console(options.console), esTransport]
  });

  return logger;
};
