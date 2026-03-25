import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class FingerprintThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const { fingerprint } = req.body;

    if (fingerprint) {
      return fingerprint;
    }

    return req.ip;
  }
}
