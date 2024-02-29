import { Injectable, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AttributeHelper } from 'ish-core/models/attribute/attribute.helper';
import { Attribute } from 'ish-core/models/attribute/attribute.model';

import { WishlistData } from './wishlist.interface';
import { Wishlist, WishlistItem } from './wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistMapper {
  private sanitizer = inject(DomSanitizer);

  fromData(wishlistData: WishlistData, wishlistId: string): Wishlist {
    if (wishlistData) {
      let items: WishlistItem[];
      if (wishlistData.items?.length) {
        items = wishlistData.items.map(item => ({
          sku: AttributeHelper.getAttributeValueByAttributeName(item.attributes, 'sku'),
          id: AttributeHelper.getAttributeValueByAttributeName(item.attributes, 'id'),
          creationDate: Number(AttributeHelper.getAttributeValueByAttributeName(item.attributes, 'creationDate')),
          desiredQuantity: {
            value: AttributeHelper.getAttributeValueByAttributeName<Attribute<number>>(
              item.attributes,
              'desiredQuantity'
            ).value,
          },
        }));
      } else {
        items = [];
      }
      return {
        id: wishlistId,
        title: this.sanitizer.sanitize(SecurityContext.HTML, wishlistData.title),
        itemsCount: wishlistData.itemsCount || 0,
        items,
      };
    } else {
      throw new Error(`wishlistData is required`);
    }
  }
}
