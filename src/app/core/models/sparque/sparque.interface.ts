export interface SparqueSuggestions {
  products: SparqueProduct[];
  categories: SparqueCategory[];
  brands: SparqueBrand[];
  keywordSuggestions: SparqueKeywordSuggestions[];
  contentSuggestions: SparqueContentSuggestions[];
}

interface SparqueProduct {
  sku: string;
  name: string;
  defaultBrandName: string;
  defaultcategoryId: string;
  gtin: string;
  shortDescription: string;
  longDescription: string;
  manufacturer: string;
  type: string;
  rank: number;
  offers: SparqueOffer[];
  productVariants: string[];
  productMaster: string;
  attributes: SparqueAttribute[];
  images: SparqueImage[];
  attachments: SparqueAttachment[];
  variantAttributes: SparqueVariantAttribute[];
}

interface SparqueCategory {
  CategoryID: string;
  CategoryName: string;
  CategoryURL: string;
  TotalCount: number;
  Position: number;
  ParentCategoryId: string;
  SubCategories: string[];
  attributes: SparqueAttribute[];
}

interface SparqueBrand {
  BrandName: string;
  TotalCount: number;
  ImageUrl: string;
}

interface SparqueKeywordSuggestions {
  Keyword: string;
}

interface SparqueContentSuggestions {
  newsType: string;
  paragraph: string;
  slug: string;
  summary: string;
  title: string;
  type: string;
  articleDate: Date;
}

interface SparqueOffer {
  priceExclVat: number;
  priceIncVat: number;
  vatAmount: number;
  vatPercentage: number;
  currency: string;
  type: string;
}

interface SparqueAttribute {
  name: string;
  value: string;
}

interface SparqueImage {
  id: string;
  extension: string;
  url: string;
  isPrimaryImage: boolean;
  attributes: SparqueAttribute[];
}

interface SparqueAttachment {
  id: string;
  extension: string;
  relativeUrl: string;
  attributes: SparqueAttribute[];
}

interface SparqueVariantAttribute {
  id: string;
  value: string;
  name: string;
  sku: string;
}
