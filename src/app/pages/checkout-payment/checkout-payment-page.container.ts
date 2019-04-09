import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';

import {
  DeleteBasketPayment,
  LoadBasketEligiblePaymentMethods,
  SetBasketPayment,
  getBasketEligiblePaymentMethods,
  getBasketError,
  getBasketLoading,
  getCurrentBasket,
} from 'ish-core/store/checkout/basket';

@Component({
  selector: 'ish-checkout-payment-page-container',
  templateUrl: './checkout-payment-page.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentPageContainerComponent implements OnInit {
  basket$ = this.store.pipe(select(getCurrentBasket));
  loading$ = this.store.pipe(select(getBasketLoading));
  paymentMethods$ = this.store.pipe(select(getBasketEligiblePaymentMethods));
  basketError$ = this.store.pipe(select(getBasketError));

  constructor(private store: Store<{}>) {}

  ngOnInit() {
    this.basket$
      .pipe(
        filter(x => !!x),
        take(1)
      )
      .subscribe(() => this.store.dispatch(new LoadBasketEligiblePaymentMethods()));
  }

  updateBasketPaymentMethod(paymentName: string) {
    this.store.dispatch(new SetBasketPayment({ id: paymentName }));
  }

  createBasketPaymentInstrument(body: { paymentMethod: string; parameters: { name: string; value: string }[] }) {
    // ToDo: call an action to create payment instrument and assign it to the basket
    console.log(body);
  }

  deletePaymentInstrument(paymentInstrumentId: string) {
    this.store.dispatch(new DeleteBasketPayment({ id: paymentInstrumentId }));
  }
}
