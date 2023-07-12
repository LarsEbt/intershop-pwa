import { CategoryTree } from 'ish-core/models/category-tree/category-tree.model';
import { Category } from 'ish-core/models/category/category.model';
import { SparqueItems, SparqueResponse, SparqueTupel } from 'ish-core/models/sparque/sparque.interface';

export class SparqueCategoriesMapper {
  static fromData(data: SparqueResponse, locale: string): CategoryTree {
    return data.items.reduce(
      (prev, curr, _idx, array) => {
        const cachedCustomIds = new Map<string, string>();
        const parent = curr.tuple[0];
        if (!cachedCustomIds.has(parent.attributes.identifier)) {
          cachedCustomIds.set(
            parent.attributes.identifier,
            SparqueCategoriesMapper.getCustomId(array, parent.attributes.identifier)
          );
        }
        const customParentId = cachedCustomIds.get(parent.attributes.identifier);

        const child = curr.tuple[1];
        if (!cachedCustomIds.has(child.attributes.identifier)) {
          cachedCustomIds.set(
            child.attributes.identifier,
            SparqueCategoriesMapper.getCustomId(array, child.attributes.identifier)
          );
        }
        const customChildId = cachedCustomIds.get(child.attributes.identifier);

        return {
          ...prev,
          rootIds:
            parent.attributes.root === 1 && !prev.rootIds.includes(customParentId)
              ? [...prev.rootIds, customParentId]
              : prev.rootIds,
          nodes: {
            ...prev.nodes,
            [customParentId]: SparqueCategoriesMapper.fromSingle(parent, customParentId, locale),
            [customChildId]: SparqueCategoriesMapper.fromSingle(child, customChildId, locale),
          },
          edges: {
            ...prev.edges,
            [customParentId]:
              prev.edges[customParentId] === undefined
                ? [customChildId]
                : [...prev.edges[customParentId], customChildId],
          },
        };
      },
      // eslint-disable-next-line ish-custom-rules/no-object-literal-type-assertion
      { nodes: {}, edges: {}, rootIds: [] } as CategoryTree
    );
  }

  private static fromSingle(data: SparqueTupel, customId: string, locale: string): Category {
    return {
      name: data.attributes.name[locale.replace('_', '-')],
      uniqueId: customId,
      completenessLevel: 2,
      categoryPath: customId.split('.').map((val, idx, arr) => {
        let id = '';
        for (let i = idx; i >= 0; i--) {
          if (id) {
            id = `${arr[i]}.${id}`;
          } else {
            id = `${val}`;
          }
        }
        return id;
      }),
      categoryRef: data.attributes.categoryref,
      hasOnlineProducts: true,
      description: data.attributes.identifier,
      images: [],
      attributes: [],
    };
  }

  private static getCustomId(data: SparqueItems[], id: string, customId = ''): string {
    if (!data?.length && !id) {
      return;
    }

    const parent = data.find(x => x.tuple[0].attributes.identifier === id);
    if (parent && parent.tuple[0].attributes.root === 1) {
      return customId.length ? `${id}.${customId}` : id;
    }

    const child = data.find(x => x.tuple[1].attributes.identifier === id);
    if (child) {
      return SparqueCategoriesMapper.getCustomId(
        data,
        child.tuple[0].attributes.identifier,
        customId.length ? `${id}.${customId}` : id
      );
    }
  }
}
