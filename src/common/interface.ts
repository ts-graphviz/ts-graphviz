/**
 * Objects that can be converted to the Dot language satisfy this interface.
 */
export interface IDot {
  toDot(): string;
}

/**
 * Objects that can be Edge destinations satisfy this interface.
 */
export interface IEdgeTarget {
  toEdgeTargetDot(): string;
}
