import { SparqueSuggestions } from './sparque.interface';
import { SparqueMapper } from './sparque.mapper';

describe('Sparque Mapper', () => {
  describe('fromSuggestionData', () => {
    const suggestionData = {
      products: [],
      categories: [],
      brands: [],
      keywordSuggestions: [{ keyword: 'phrase1' }, { keyword: 'phrase2' }],
      contentSuggestions: [],
    } as SparqueSuggestions;

    it(`should return SuggestTerms when getting a SparqueSuggestions`, () => {
      const keyWordSuggestTerms = SparqueMapper.fromSuggestionData(suggestionData);

      expect(keyWordSuggestTerms).toBeTruthy();
      expect(keyWordSuggestTerms).toHaveLength(2);
      expect(keyWordSuggestTerms).toMatchInlineSnapshot(`
        [
          {
            "term": "phrase1",
          },
          {
            "term": "phrase2",
          },
        ]
      `);
    });
  });
});
