import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable()
export class AzureService {
  private graphClient: Client;
  constructor(private configService: ConfigService) {
    const credentials = new ClientSecretCredential(
      this.configService.get<string>('azure.tenantId') as string,
      this.configService.get<string>('azure.clientId') as string,
      this.configService.get<string>('azure.secret') as string,
    );
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credentials.getToken(
            'https://graph.microsoft.com/.default',
          );
          return token?.token || '';
        },
      },
    });
  }

  async getUsers() {
    const result = await this.graphClient.api('/users').get();
    return result.value;
  }
}
