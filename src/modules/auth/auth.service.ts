import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfidentialClientApplication,
  Configuration,
  AuthorizationUrlRequest,
} from '@azure/msal-node';

@Injectable()
export class AuthService {
  private entraClient: ConfidentialClientApplication;
  constructor(
    private configService: ConfigService<
      {
        ENTRA_CLIENT_ID: string;
        ENTRA_TENANT_ID: string;
        ENTRA_CLIENT_SECRET: string;
        ENTRA_INSTANCE: string;
        ENTRA_REDIRECT_URL: string;
        GRAPH_API_ENDPOINT: string;
      },
      true
    >,
  ) {
    const entraConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('ENTRA_CLIENT_ID'),
        authority: `${this.configService.get<string>('ENTRA_CLIENT_ID')}${this.configService.get<string>('ENTRA_CLIENT_ID')}`,
        clientSecret: this.configService.get<string>('ENTRA_CLIENT_SECRET'),
      },
    };
    this.entraClient = new ConfidentialClientApplication(entraConfig);
  }

  async logIn(): Promise<string> {
    const authUrlRequest: AuthorizationUrlRequest = {
      scopes: ['user.read'],
      redirectUri: this.configService.get<string>('ENTRA_REDIRECT_URL'),
    };
    return await this.entraClient.getAuthCodeUrl(authUrlRequest);
  }
}
