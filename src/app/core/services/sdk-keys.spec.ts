import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SdkKeysService } from './sdk-keys';

describe('SdkKeysService', () => {
  let service: SdkKeysService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SdkKeysService]
    });
    service = TestBed.inject(SdkKeysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
