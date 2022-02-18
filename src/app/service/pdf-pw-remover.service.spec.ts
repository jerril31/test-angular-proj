import { TestBed } from '@angular/core/testing';

import { PdfPwRemoverService } from './pdf-pw-remover.service';

describe('PdfPwRemoverService', () => {
  let service: PdfPwRemoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfPwRemoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
