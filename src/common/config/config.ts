import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },

  swagger: {
    enabled: true,
    title: 'Nestjs Toy Project',
    description: 'The nestjs API description',
    version: '1.0.0',
    path: 'api',
  },

  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },

  security: {
    expiresIn: '30m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
};

export default (): Config => config;
