import { ModuleWithProviders, NgModule } from '@angular/core';

import { AttributeToStringPipe } from './models/attribute/attribute.pipe';
import { PricePipe } from './models/price/price.pipe';
import { DatePipe } from './pipes/date.pipe';
import { MakeHrefPipe } from './pipes/make-href.pipe';
import { ProductRoutePipe } from './pipes/product-route.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';

const pipes = [AttributeToStringPipe, DatePipe, MakeHrefPipe, PricePipe, ProductRoutePipe, SafeHtmlPipe, SanitizePipe];

@NgModule({
  declarations: [...pipes],
  exports: [...pipes],
})
export class PipesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PipesModule,
      providers: [...pipes],
    };
  }
}
