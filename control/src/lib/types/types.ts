
export interface INode{

}

export interface IExtendedNode extends INode{

}
export interface ILocalizedText{

}
export interface IBrowseName{

}
export enum ENodeClass{
  Unspecified = 0,
  Object = 1,
  Variable = 2,
  Method = 4,
  ObjectType = 8,
  VariableType = 16,
  ReferenceType = 32,
  DataType = 64,
  nodeClassView = 128,
}

export interface IReference{
	browseName?:IBrowseName;
	displayName:ILocalizedText;
	isForward?:boolean;
	node?:IExtendedNode;
	nodeClass?:ENodeClass;
	referenceType?:INode;
	typeDefinition?:IExtendedNode;
}