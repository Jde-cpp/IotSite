import Long from "long";
import {Guid, NodeId, INodeId, NodeIdJson} from "./NodeId";
import { ExNodeId, IExNodeId, ExNodeIdJson } from "./ExNodeId";
import { Timestamp, Value } from "./Value";

export function toBinary( x:string ):Uint8Array{  return Uint8Array.from( atob(x), c => c.charCodeAt(0) ); }

export type OpcId = string;
export type NodeKey = Symbol;

export enum ENodes{
	ObjectsFolder = 85, /* Object */
	Server = 2253
}


export interface ILocalizedText{
	locale: string;
	text: string;
}

export interface IBrowseName{
	ns:number;
	name:String;
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
export enum ETypes{
	None = 0,
	Boolean = 1,
	SByte = 2,
	Byte = 3,
	Int16 = 4,
	UInt16 = 5,
	Int32 = 6,
	UInt32 = 7,
	Int64 = 8,
	UInt64 = 9,
	Float = 10,
	Double = 11,
	String = 12,
	BaseDataType = 24,
	FolderType = 61
}