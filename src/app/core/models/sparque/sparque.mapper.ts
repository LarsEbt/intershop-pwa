import { SparqueSuggestions } from 'ish-core/models/sparque/sparque.interface';
import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';

export class SparqueMapper {
  static fromSuggestionData(data: SparqueSuggestions): SuggestTerm[] {
    const terms: SuggestTerm[] = [];
    if (data) {
      data.keywordSuggestions
        ?.map(suggestions => suggestions.keyword)
        .forEach(keyword => {
          terms.push({ term: keyword });
        });
    }
    return terms;
  }
}
