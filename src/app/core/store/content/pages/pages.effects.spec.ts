import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { cold, hot } from 'jest-marbles';
import { Observable, of, throwError } from 'rxjs';
import { instance, mock, verify, when } from 'ts-mockito';

import { ContentPageTreeElement } from 'ish-core/models/content-page-tree/content-page-tree.model';
import { ContentPageletEntryPoint } from 'ish-core/models/content-pagelet-entry-point/content-pagelet-entry-point.model';
import { CMSService } from 'ish-core/services/cms/cms.service';
import { ContentStoreModule } from 'ish-core/store/content/content-store.module';
import { loadContentPageTreeSuccess } from 'ish-core/store/content/page-tree';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';
import { pageTree } from 'ish-core/utils/dev/test-data-utils';

import { loadContentPage, loadContentPageFail, loadContentPageSuccess } from './pages.actions';
import { PagesEffects } from './pages.effects';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

describe('Pages Effects', () => {
  let actions$: Observable<Action>;
  let effects: PagesEffects;
  let cmsServiceMock: CMSService;
  let router: Router;
  let store$: Store;

  beforeEach(() => {
    cmsServiceMock = mock(CMSService);

    TestBed.configureTestingModule({
      imports: [
        ContentStoreModule.forTesting('pagetree', 'pages'),
        CoreStoreModule.forTesting(['router']),
        RouterTestingModule.withRoutes([{ path: 'page/:contentPageId', children: [] }]),
        NgxMatomoTrackerModule.forRoot({ disabled: true, trackerUrl: undefined, siteId: undefined })
      ],
      providers: [
        { provide: CMSService, useFactory: () => instance(cmsServiceMock) },
        PagesEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(PagesEffects);
    router = TestBed.inject(Router);
    store$ = TestBed.inject(Store);
  });

  describe('loadPages$', () => {
    it('should send fail action when loading action via service is unsuccessful', done => {
      when(cmsServiceMock.getContentPage('dummy')).thenReturn(throwError(() => makeHttpError({ message: 'ERROR' })));

      actions$ = of(loadContentPage({ contentPageId: 'dummy' }));

      effects.loadContentPage$.subscribe(action => {
        verify(cmsServiceMock.getContentPage('dummy')).once();
        expect(action).toMatchInlineSnapshot(`
          [Content Page API] Load Content Page Fail:
            error: {"name":"HttpErrorResponse","message":"ERROR"}
        `);
        done();
      });
    });

    it('should not die when encountering an error', () => {
      when(cmsServiceMock.getContentPage('dummy')).thenReturn(throwError(() => makeHttpError({ message: 'ERROR' })));

      actions$ = hot('a-a-a-a', { a: loadContentPage({ contentPageId: 'dummy' }) });

      expect(effects.loadContentPage$).toBeObservable(
        cold('a-a-a-a', { a: loadContentPageFail({ error: makeHttpError({ message: 'ERROR' }) }) })
      );
    });
  });

  describe('selectedContentPage$', () => {
    it('should select the route when url parameter is available', done => {
      effects.selectedContentPage$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`
          [Content Page] Load Content Page:
            contentPageId: "dummy"
        `);
        done();
      });

      router.navigateByUrl('/page/dummy');
    });
  });

  describe('setBreadcrumbForContentPage$', () => {
    const tree1 = { contentPageId: '1', name: 'page 1', path: ['1'] } as ContentPageTreeElement;
    const tree2 = { contentPageId: '1.1', name: 'page 1.1', path: ['1', '1.1'] } as ContentPageTreeElement;

    beforeEach(fakeAsync(() => {
      router.navigateByUrl('/page/1.1');
      tick(500);
      store$.dispatch(
        loadContentPageSuccess({
          page: { id: '1.1', displayName: 'page 1.1' } as ContentPageletEntryPoint,
          pagelets: [],
        })
      );
    }));

    it('should set breadcrumb if selected content page is not part of a page tree', done => {
      effects.setBreadcrumbForContentPage$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`
          [Viewconf Internal] Set Breadcrumb Data:
            breadcrumbData: [{"key":"page 1.1"}]
        `);
        done();
      });
    });

    it('should set page breadcrumb if selected content page is part of a page tree', done => {
      store$.dispatch(loadContentPageTreeSuccess({ pagetree: pageTree([tree1, tree2]) }));
      effects.setBreadcrumbForContentPage$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`
          [Viewconf Internal] Set Breadcrumb Data:
            breadcrumbData: [{"key":"page 1","link":"/page/1"},{"key":"page 1.1"}]
        `);
        done();
      });
    });
  });
});
