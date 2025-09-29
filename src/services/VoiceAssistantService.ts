interface CreateSessionRequest {
  model?: string;
  voice?: string;
}

interface ClientSecret {
  expires_at: number;
  value: string;
}

interface CreateSessionResponse {
  session_id: string;
  client_secret: ClientSecret;
  expires_at: string;
  ice_servers?: Array<{
    urls: string[];
    username?: string;
    credential?: string;
  }>;
}

interface APIError {
  error: string;
}

class VoiceAssistantAPI {
  private baseURL: string;
  private rateLimitDelay: number = 6000; // 6 seconds between requests
  private lastRequestTime: number = 0;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delayTime = this.rateLimitDelay - timeSinceLastRequest;
      await this.delay(delayTime);
    }

    this.lastRequestTime = Date.now();
  }

  async createSession(
    request: CreateSessionRequest = {},
  ): Promise<CreateSessionResponse> {
    await this.enforceRateLimit();

    const url = `${this.baseURL}/session`;

    const payload = {
      model: request.model || 'gpt-4o-realtime-preview',
      ...(request.voice && {voice: request.voice}),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(`API Error: ${errorData.error}`);
      }

      const json = await response.json();
      console.log('json', json);

      const sessionData: CreateSessionResponse = json;
      return sessionData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
      throw new Error('Failed to create session: Unknown error');
    }
  }

  async prewarmSession(): Promise<CreateSessionResponse> {
    await this.enforceRateLimit();

    const url = `${this.baseURL}/session/prewarm`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(`API Error: ${errorData.error}`);
      }

      const sessionData: CreateSessionResponse = await response.json();
      return sessionData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to prewarm session: ${error.message}`);
      }
      throw new Error('Failed to prewarm session: Unknown error');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Create a session specifically for OpenAI Realtime
   */
  async createRealtimeSession(
    request: CreateSessionRequest = {},
  ): Promise<CreateSessionResponse> {
    const realtimeRequest = {
      ...request,
      model: request.model || 'gpt-4o-realtime-preview',
    };

    return this.createSession(realtimeRequest);
  }

  /**
   * Validate if a session is still valid
   */
  isSessionValid(session: CreateSessionResponse): boolean {
    if (!session.client_secret) return false;

    const now = Date.now();
    const expiresAt = new Date(session.client_secret.expires_at).getTime();

    return now < expiresAt;
  }
}

export default VoiceAssistantAPI;
export type {CreateSessionRequest, CreateSessionResponse};
