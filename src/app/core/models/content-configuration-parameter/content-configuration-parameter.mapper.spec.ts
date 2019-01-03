import { TestBed } from '@angular/core/testing';
import * as using from 'jasmine-data-provider';

import { STATIC_URL } from 'ish-core/utils/state-transfer/factories';

import { ContentConfigurationParameterData } from './content-configuration-parameter.interface';
import { ContentConfigurationParameterMapper } from './content-configuration-parameter.mapper';

describe('Content Configuration Parameter Mapper', () => {
  let contentConfigurationParameterMapper: ContentConfigurationParameterMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: STATIC_URL, useValue: 'http://www.example.org/static' }],
    });

    contentConfigurationParameterMapper = TestBed.get(ContentConfigurationParameterMapper);
  });

  it('should return a value for undefined input', () => {
    const result = contentConfigurationParameterMapper.fromData(undefined);
    expect(result).not.toBeUndefined();
    expect(result).toBeEmpty();
  });

  it('should map to simple dictionary', () => {
    const input: { [name: string]: ContentConfigurationParameterData } = {
      key1: {
        definitionQualifiedName: 'name1',
        value: '1',
      },
      key2: {
        definitionQualifiedName: 'name2',
        value: 'hello',
      },
      key3: {
        definitionQualifiedName: 'name3',
        value: ['hello', 'world'],
      },
    };

    const result = contentConfigurationParameterMapper.fromData(input);
    expect(result).not.toBeEmpty();
    expect(result).toHaveProperty('key1', '1');
    expect(result).toHaveProperty('key2', 'hello');
    expect(result).toHaveProperty('key3', ['hello', 'world']);
    expect(result).toMatchSnapshot();
  });

  describe('postProcessImageURLs', () => {
    using(
      [
        {
          key: 'Image',
          input: 'assets/pwa/pwa_home_teaser_1.jpg',
          expected: 'assets/pwa/pwa_home_teaser_1.jpg',
        },
        {
          key: 'Image',
          input: 'site:/pwa/pwa_home_teaser_1.jpg',
          expected: 'http://www.example.org/static/site/-/pwa/pwa_home_teaser_1.jpg',
        },
        {
          key: 'ImageXS',
          input: 'site:/pwa/pwa_home_teaser_1.jpg',
          expected: 'http://www.example.org/static/site/-/pwa/pwa_home_teaser_1.jpg',
        },
        {
          key: 'Other',
          input: 'site:/pwa/pwa_home_teaser_1.jpg',
          expected: 'site:/pwa/pwa_home_teaser_1.jpg',
        },
      ],
      ({ key, input, expected }) => {
        it(`should transform ${input} to ${expected} for key ${key}`, () => {
          expect(contentConfigurationParameterMapper.postProcessImageURLs({ [key]: input })).toEqual({
            [key]: expected,
          });
        });
      }
    );
  });
});
