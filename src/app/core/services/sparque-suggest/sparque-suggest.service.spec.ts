import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';
import { SparqueApiService } from 'ish-core/services/sparque-api/sparque-api.service';

import { SparqueSuggestService } from './sparque-suggest.service';

describe('Sparque Suggest Service', () => {
  let sparqueApiService: SparqueApiService;
  let suggestService: SparqueSuggestService;

  beforeEach(() => {
    sparqueApiService = mock(SparqueApiService);
    when(sparqueApiService.get(anything(), anything())).thenReturn(of<SuggestTerm[]>([]));
    TestBed.configureTestingModule({
      providers: [{ provide: SparqueApiService, useFactory: () => instance(sparqueApiService) }],
    });
    suggestService = TestBed.inject(SparqueSuggestService);
  });

  it('should always delegate to api service when called', () => {
    verify(sparqueApiService.get(anything(), anything())).never();

    suggestService.search('some');
    verify(sparqueApiService.get(anything(), anything())).once();
  });

  it('should return the matched terms when search term is executed', done => {
    when(sparqueApiService.get(anything(), anything())).thenReturn(of({ keywordSuggestions: [{ keyword: 'Goods' }] }));

    suggestService.search('g').subscribe(res => {
      expect(res).toMatchInlineSnapshot(`
        [
          {
            "term": "Goods",
          },
        ]
      `);
      verify(sparqueApiService.get(anything(), anything())).once();
      done();
    });
  });
});
