import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { SparqueSuggestions } from 'ish-core/models/sparque/sparque.interface';
import { SparqueMapper } from 'ish-core/models/sparque/sparque.mapper';
import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';
import { SparqueApiService } from 'ish-core/services/sparque-api/sparque-api.service';
import { SuggestService } from 'ish-core/services/suggest/suggest.service';

/**
 * The Suggest Service handles the interaction with the 'suggest' REST API of the Sparque wrapper.
 */
@Injectable({ providedIn: 'root' })
export class SparqueSuggestService implements SuggestService {
  constructor(private sparqueApiService: SparqueApiService) {}

  /**
   * Returns a list of suggested search terms matching the given search term.
   *
   * @param searchTerm  The search term to get suggestions for.
   * @returns           List of suggested search terms.
   */
  search(searchTerm: string): Observable<SuggestTerm[]> {
    const params = new HttpParams().set('Keyword', searchTerm);
    return this.sparqueApiService
      .get<SparqueSuggestions>(`suggestions`, { params })
      .pipe(map(element => SparqueMapper.fromSuggestionData(element)));
  }
}
