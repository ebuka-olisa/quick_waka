export class CategoryDetailsViewModel {
    id: number;
    name: string;
    description?: string;
    parentId?: string;
    parent?: CategoryDetailsViewModel;
    imageUrl?: string;
    pictureRemoved?: boolean;
    properties?: Property[];
    candelete?: boolean;
}

export class CategoryLiteViewModel {
    id: number;
    name: string;
    nameId: string;
}

export class CategoryWithParentLiteViewModel extends CategoryLiteViewModel{
    parent: CategoryWithParentLiteViewModel;
}

export class Property {
    id?: number;
    prod_CategoryId?: number;
    prod_PropertyTypeId: number;
    propertyTypeName: string;
    prod_MeasurementTypeId?: number;
    measurementTypeSymbol?: string;
    canDelete: boolean;
}
