import { Routes } from '@angular/router';

import { ProductPageContainerComponent } from './product-page.container';

export const productPageRoutes: Routes = [
  {
    path: ':sku',
    children: [
      {
        path: '**',
        component: ProductPageContainerComponent,
      },
    ],
  },
];
