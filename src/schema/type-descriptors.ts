export type TypeDescriptorUnion =
    NullTypeDescriptor |
    AnyTypeDescriptor |
    NeverTypeDescriptor |
    BooleanTypeDescriptor |
    NumberTypeDescriptor |
    StringTypeDescriptor |
    TupleTypeDescriptor |
    ArrayTypeDescriptor |
    InterfaceTypeDescriptor |
    RecordTypeDescriptor;

export interface NullTypeDescriptor {
    type: "null"
}

export interface AnyTypeDescriptor {
    type: "any"
}

export interface NeverTypeDescriptor {
    type: "never"
}

export interface BooleanTypeDescriptor {
    type: "boolean"
    options?: boolean[]
}

export interface NumberTypeDescriptor {
    type: "number"
    numberType: "integer" | "float"
    options?: number[]
    minimumInclusive?: number
    minimumExclusive?: number
    maximumInclusive?: number
    maximumExclusive?: number
    multipleOf?: number
}

export interface StringTypeDescriptor {
    type: "string"
    options?: string[]
    minimumLength?: number
    maximumLength?: number
    valuePattern?: string
}

export interface TupleTypeDescriptor {
    type: "tuple"
    uniqueItems?: boolean
    itemTypeNodeIds: Array<string | boolean>
}

export interface ArrayTypeDescriptor {
    type: "array"
    minimumItems?: number
    maximumItems?: number
    uniqueItems?: boolean
    itemTypeNodeId: string | boolean
}

export interface InterfaceTypeDescriptor {
    type: "interface"
    requiredProperties: string[]
    propertyTypeNodeIds: Record<string, string | boolean>
}

export interface RecordTypeDescriptor {
    type: "record"
    requiredProperties: string[]
    minimumProperties?: number
    maximumProperties?: number
    propertyTypeNodeId: string | boolean
}

