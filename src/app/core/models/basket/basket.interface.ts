import { AddressData } from 'ish-core/models/address/address.interface';
import { Attribute } from 'ish-core/models/attribute/attribute.model';
import { BasketApproval } from 'ish-core/models/basket-approval/basket-approval.model';
import { BasketInfo } from 'ish-core/models/basket-info/basket-info.model';
import { BasketRebateData } from 'ish-core/models/basket-rebate/basket-rebate.interface';
import { BasketTotalData } from 'ish-core/models/basket-total/basket-total.interface';
import { CustomFieldData } from 'ish-core/models/custom-field/custom-field.interface';
import { LineItemData } from 'ish-core/models/line-item/line-item.interface';
import { PaymentInstrument } from 'ish-core/models/payment-instrument/payment-instrument.model';
import { PaymentMethodBaseData } from 'ish-core/models/payment-method/payment-method.interface';
import { PaymentData } from 'ish-core/models/payment/payment.interface';
import { PriceItemData } from 'ish-core/models/price-item/price-item.interface';
import { ShippingMethodData } from 'ish-core/models/shipping-method/shipping-method.interface';

export interface BasketBaseData {
  id: string;
  calculated: boolean;
  purchaseCurrency?: string;
  invoiceToAddress?: string;
  commonShipToAddress?: string;
  commonShippingMethod?: string;
  costCenter?: string;
  customer?: string;
  user?: string;
  discounts?: {
    dynamicMessages?: string[];
    shippingBasedDiscounts?: string[];
    valueBasedDiscounts?: string[];
  };
  buckets?: string[];
  externalOrderReference?: string;
  lineItems?: string[];
  messageToMerchant?: string;
  payments?: string[];
  promotionCodes?: string[];
  totals: BasketTotalData;
  totalProductQuantity?: number;
  surcharges?: {
    itemSurcharges?: {
      amount: PriceItemData;
      description: string;
      name: string;
    }[];
    bucketSurcharges?: {
      amount: PriceItemData;
      description: string;
      name: string;
    }[];
  };
  approval?: BasketApproval;
  attributes?: Attribute[];
  buyer?: {
    companyName?: string;
    companyName2?: string;
    firstName: string;
    lastName: string;
  };
  customFields?: CustomFieldData[];
}

export interface BasketData {
  data: BasketBaseData;
  included?: {
    invoiceToAddress?: { [urn: string]: AddressData };
    lineItems?: { [id: string]: LineItemData };
    discounts?: { [id: string]: BasketRebateData };
    lineItems_discounts?: { [id: string]: BasketRebateData };
    commonShipToAddress?: { [urn: string]: AddressData };
    commonShippingMethod?: { [id: string]: ShippingMethodData };
    payments?: { [id: string]: PaymentData };
    payments_paymentMethod?: { [id: string]: PaymentMethodBaseData };
    payments_paymentInstrument?: { [id: string]: PaymentInstrument };
  };
  infos?: BasketInfo[];
}
