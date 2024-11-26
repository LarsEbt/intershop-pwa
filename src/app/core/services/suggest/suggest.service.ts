import { inject } from '@angular/core';
import { Observable, take } from 'rxjs';

import { SparqueConfig } from 'ish-core/models/sparque/sparque-config.model';
import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';
import { ApiService } from 'ish-core/services/api/api.service';
import { DefaultSuggestService } from 'ish-core/services/default-suggest/default-suggest.service';
import { SparqueApiService } from 'ish-core/services/sparque-api/sparque-api.service';
import { SparqueSuggestService } from 'ish-core/services/sparque-suggest/sparque-suggest.service';
import { StatePropertiesService } from 'ish-core/utils/state-transfer/state-properties.service';

export abstract class SuggestService {
  abstract search(searchTerm: string): Observable<SuggestTerm[]>;
}

export function suggestServiceFactory() {
  const statePropertiesService = inject(StatePropertiesService);
  let isSparqueConfigured = false;

  statePropertiesService
    .getStateOrEnvOrDefault<SparqueConfig>('sparque', 'sparque')
    .pipe(take(1))
    .subscribe(occurrence => {
      if (occurrence) {
        isSparqueConfigured = true;
      }
    });

  if (isSparqueConfigured) {
    return new SparqueSuggestService(inject(SparqueApiService));
  }
  return new DefaultSuggestService(inject(ApiService));
}
