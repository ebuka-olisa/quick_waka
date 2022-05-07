import { Property } from './category';

export class ExtraAttributeDetailsViewModel {
    id: number;
    name: string;
    description?: string;
    candelete?: boolean;
    isFromParent?: boolean;
}

export class ProductExtraAttributesViewModel extends ExtraAttributeDetailsViewModel{
    properties: Property[];
    selectedProperty: number;
    value: string;
}
