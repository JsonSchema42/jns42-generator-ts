export interface Node {
	superNodeId?: string;
	deprecated: boolean;
	title: string;
	description: string;
	examples: unknown[];
	types: TypeUnion[];
	compounds: CompoundUnion[];
}

export type TypeUnion =
	| NullType
	| AnyType
	| NeverType
	| BooleanType
	| NumberType
	| StringType
	| TupleType
	| ArrayType
	| InterfaceType
	| RecordType;

export interface NullType {
	type: "null";
}

export interface AnyType {
	type: "any";
}

export interface NeverType {
	type: "never";
}

export interface BooleanType {
	type: "boolean";
	options?: boolean[];
}

export interface NumberType {
	type: "number";
	numberType: "integer" | "float";
	options?: number[];
	minimumInclusive?: number;
	minimumExclusive?: number;
	maximumInclusive?: number;
	maximumExclusive?: number;
	multipleOf?: number;
}

export interface StringType {
	type: "string";
	options?: string[];
	minimumLength?: number;
	maximumLength?: number;
	valuePattern?: string;
}

export interface TupleType {
	type: "tuple";
	itemTypeNodeIds: Array<string>;
}

export interface ArrayType {
	type: "array";
	minimumItems?: number;
	maximumItems?: number;
	uniqueItems?: boolean;
	itemTypeNodeId: string;
}

export interface InterfaceType {
	type: "interface";
	requiredProperties: string[];
	propertyTypeNodeIds: Record<string, string>;
}

export interface RecordType {
	type: "record";
	requiredProperties: string[];
	minimumProperties?: number;
	maximumProperties?: number;
	propertyTypeNodeId: string;
}

export type CompoundUnion = OneOfCompound | AnyOfCompound | AllOfCompound;

export interface OneOfCompound {
	type: "one-of";
	typeNodeIds: string[];
}

export interface AnyOfCompound {
	type: "any-of";
	typeNodeIds: string[];
}

export interface AllOfCompound {
	type: "all-of";
	typeNodeIds: string[];
}
