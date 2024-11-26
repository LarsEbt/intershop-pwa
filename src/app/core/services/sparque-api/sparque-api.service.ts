import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatLatestFrom } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, defer, first, forkJoin, iif, map, of, switchMap, take } from 'rxjs';

import { FeatureToggleService } from 'ish-core/feature-toggle.module';
import { SparqueConfig } from 'ish-core/models/sparque/sparque-config.model';
import { ApiService, AvailableOptions } from 'ish-core/services/api/api.service';
import { TokenService } from 'ish-core/services/token/token.service';
import { getCurrentLocale } from 'ish-core/store/core/configuration';
import { ApiTokenService } from 'ish-core/utils/api-token/api-token.service';
import { whenTruthy } from 'ish-core/utils/operators';
import { StatePropertiesService } from 'ish-core/utils/state-transfer/state-properties.service';

const SPARQUE_CONFIG_EXCLUDE_PARAMS = ['url', 'wrapperAPI'];

@Injectable({ providedIn: 'root' })
export class SparqueApiService extends ApiService {
  constructor(
    protected httpClient: HttpClient,
    protected store: Store,
    protected featureToggleService: FeatureToggleService,
    private apiTokenService: ApiTokenService,
    private tokenService: TokenService,
    private statePropertiesService: StatePropertiesService
  ) {
    super(httpClient, store, featureToggleService);
  }

  protected constructHttpClientParams(
    path: string,
    options?: AvailableOptions
  ): Observable<[string, { headers: HttpHeaders; params: HttpParams }]> {
    return forkJoin([
      this.constructUrlForPath(path),
      defer(() =>
        this.constructHeaders(options).pipe(
          map(headers => ({
            headers,
            params: options
              ? options.params
                  .keys()
                  .reduce((acc, key) => acc.set(key, options.params.get(key)), this.sparqueQueryToHttpParams())
              : this.sparqueQueryToHttpParams(),
            responseType: options?.responseType,
          }))
        )
      ),
    ]);
  }

  private sparqueQueryToHttpParams(): HttpParams {
    let sparqueParams = new HttpParams();

    this.statePropertiesService
      .getStateOrEnvOrDefault<SparqueConfig>('sparque', 'sparque')
      .pipe(
        take(1),
        concatLatestFrom(() => this.store.pipe(select(getCurrentLocale)))
      )
      .subscribe(([config, locale]) => {
        Object.keys(config).forEach(key => {
          if (!SPARQUE_CONFIG_EXCLUDE_PARAMS.includes(key)) {
            sparqueParams = sparqueParams.append(key, String(config[key]));
          }
        });
        sparqueParams = sparqueParams.append('Locale', locale.replace('_', '-'));
      });
    return sparqueParams;
  }

  /**
   * merges supplied and default headers
   */
  protected constructHeaders(options?: AvailableOptions): Observable<HttpHeaders> {
    return this.apiTokenService.apiToken$.pipe(
      first(),
      switchMap(apiToken =>
        iif(() => !!apiToken, of(apiToken), this.tokenService.fetchToken('anonymous')).pipe(
          whenTruthy(),
          first(),
          switchMap(apiToken => {
            const defaultHeader = new HttpHeaders().set('Authorization', `bearer ${apiToken}`);

            return of(
              options?.headers
                ? // append incoming headers to default ones
                  options.headers.keys().reduce((acc, key) => acc.set(key, options.headers.get(key)), defaultHeader)
                : // just use default headers
                  defaultHeader
            );
          })
        )
      )
    );
  }

  constructUrlForPath(path: string): Observable<string> {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return of(path);
    }
    return combineLatest([
      this.statePropertiesService.getStateOrEnvOrDefault<SparqueConfig>('sparque', 'sparque').pipe(
        whenTruthy(),
        map(config => config.url.concat('/api/', config.wrapperAPI))
      ),
      of(`/${path}`),
    ]).pipe(
      first(),
      map(arr => arr.join(''))
    );
  }
}
