export type CompoundDescriptorUnion =
    OneOfCompoundDescriptor |
    AnyOfCompoundDescriptor |
    AllOfCompoundDescriptor;

export interface OneOfCompoundDescriptor {
    type: "one-of"
    typeNodeIds: string[]
}

export interface AnyOfCompoundDescriptor {
    type: "any-of"
    typeNodeIds: string[]
}

export interface AllOfCompoundDescriptor {
    type: "all-of"
    typeNodeIds: string[]
}

