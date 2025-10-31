export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN', 
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private isProduction: boolean;

  private constructor() {
    this.level = this.getLogLevelFromEnv();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public error(message: string, context: LogContext = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }

  public warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  private log(level: LogLevel, message: string, context: LogContext = {}): void {

    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = this.formatLogEntry(level, timestamp, message, context);

    this.writeToConsole(level, logEntry);

    if (this.isProduction) {
      this.writeToFile(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3
    };

    return levelPriority[level] <= levelPriority[this.level];
  }

  private formatLogEntry(level: LogLevel, timestamp: string, message: string, context: LogContext): string {
    const logData = {
      timestamp,
      level,
      message,
      ...context,
      service: 'blood-donation-whatsapp-bot',
      environment: process.env.NODE_ENV || 'development'
    };

    return JSON.stringify(logData);
  }

  private writeToConsole(level: LogLevel, logEntry: string): void {
    if (this.isProduction) {
      console.log(logEntry);
      return;
    }

    //pretty print during development
    const logData = JSON.parse(logEntry);
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // red
      [LogLevel.WARN]: '\x1b[33m',  // yellow
      [LogLevel.INFO]: '\x1b[36m',  // cyan
      [LogLevel.DEBUG]: '\x1b[90m'  // gray
    };

    const resetColor = '\x1b[0m';
    const color = colors[level] || resetColor;

    console.log(
      `${color}${logData.timestamp} [${level}] ${logData.message}${resetColor}`,
      Object.keys(logData).length > 4 ? 
        { ...logData, timestamp: undefined, level: undefined, message: undefined } : 
        ''
    );
  }

  private writeToFile(logEntry: string): void {

  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getLevel(): LogLevel {
    return this.level;
  }
}

export const logger = Logger.getInstance();