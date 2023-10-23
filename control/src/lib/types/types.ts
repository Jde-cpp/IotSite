import { environment } from '../../../environments/environment';
import Long from "long";
import {Error} from "./Error";

export class Guid{
	constructor( x:string ){
		let trimmed = x.replace( /-/g, '' );
		this.value = Uint8Array.from( trimmed.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)) );
	}
	toString():string{
		let y = this.value.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
		return `${y.substring(0, 8)}-${y.substring(8, 12)}-${y.substring(12, 16)}-${y.substring(16, 20)}-${y.substring(20)}`;
	}
	value:Uint8Array;
}
export function toBinary( x:string ):Uint8Array{  return Uint8Array.from( atob(x), c => c.charCodeAt(0) ); }
export type NodeId = number | string | Guid | Uint8Array;
export type Namespace = string | number;
export class Timestamp{seconds:number; nanos:number;}
export type Value = string | number | boolean | Long | Guid | Uint8Array | Timestamp | ExtendedNode | Node | Error | Value[];

export function toString( value: Value ){
	if( typeof value === "string" )
		return value;
	else if( typeof value === "number" )
		return value.toString();
	else if( typeof value === "boolean" )
		return value.toString();
	else if( value instanceof Long )
		return value.toString();
	else if( value instanceof Guid )
		return value.toString();
	else if( value instanceof Uint8Array )
		return btoa( value.reduce((acc, current) => acc + String.fromCharCode(current), "") );
	else if( value instanceof Timestamp )
		return `${value.seconds}.${value.nanos}`;
	else if( value instanceof ExtendedNode )
		return value.toJson();
	else if( value instanceof Node )
		return value.id.toString();
	else if( value instanceof Error )
		return value.toString();
	else if( Array.isArray(value) )
		return value.map( x=>this.toString(x) ).join( "," );
	else
		return `unknown type ${typeof value}`;
}

export interface INode{
	ns:Namespace;
	id:NodeId;
}
export type NodeJson = {ns?:number, nsu?:string,s?:string,i?:number,g?:string,b?:string};
export class Node implements INode{
	constructor( json:NodeJson ){
		this.ns =  json.ns ? +json.ns : undefined;
		if( json.i!==undefined )
			this.id = +json.i;
		else if( json.s!==undefined )
			this.id = json.s;
		else if( json.g!==undefined )
			this.id = new Guid( json.g );
		else if( json.b!==undefined )
			this.id = toBinary( json.b );
		else
			this.id = environment.defaultNode;
	}
	public equals(obj: Node) : boolean { return this.ns==obj.ns && this.id==obj.id; }
	toJson():NodeJson{
		let json:NodeJson = {};
		if( typeof this.ns === "number" )
			json.ns = this.ns;
		else
			json.nsu = this.ns;

		let idValue = this.id;
		if( typeof this.id === "number" )
			json.i = this.id;
		else if( typeof this.id === "string" )
			json.s = this.id;
		else if( this.id instanceof Guid )
			json.g = this.id.toString();
		else if( this.id instanceof Uint8Array )
			json.b = btoa( this.id.reduce((acc, current) => acc + String.fromCharCode(current), "") );

		return json;
	}
	ns:number;
	id:NodeId;
}

export interface IExtendedNode extends INode{
	serverIndex:number;
	nsu:string;
}
export type ExtendedNodeJson = {nsu?:string,serverIndex?:number} & NodeJson;
export class ExtendedNode extends Node implements IExtendedNode{
	constructor( json: ExtendedNodeJson ){
		super(json);
		this.serverIndex = json.serverIndex;
		this.nsu = json.nsu;
		if( !super.ns && !this.nsu )
			this.ns = environment.defaultNS;
	}
	public override equals(obj: ExtendedNode) : boolean { return super.equals(obj) && this.serverIndex==obj.serverIndex && this.nsu==obj.nsu; }

	serverIndex:number;
	nsu:string;
}

export interface ILocalizedText{
	locale: string;
	text: string;

}
export interface IBrowseName{
	ns:Namespace;
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

export enum ENodes{
	ObjectsFolder = 85 /* Object */
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
export class Reference{
	constructor( json:{browseName:IBrowseName, displayName:ILocalizedText, isForward:boolean, node?:ExtendedNodeJson, nodeClass?:number, referenceType?:NodeJson, typeDefinition?:ExtendedNodeJson, value:any } ){
		this.browseName = json.browseName;
		this.displayName = json.displayName;
		this.isForward = json.isForward;
		this.node = new ExtendedNode( json.node );
		this.nodeClass = <ENodeClass>json.nodeClass;
		this.referenceType = new Node( json.referenceType );
		this.typeDefinition = new ExtendedNode( json.typeDefinition );
		if( json.value.sc ){
			this.value = new Error( json.value.sc );
		}
		else
			this.value = json.value;
		// if( this.referenceType.id==ENodes.ObjectsFolder )
		// 	this.referenceType.id = environment.defaultNode;
	}
	toValue( obj:string ):Value{
		return obj;
	}
	nodeParams():NodeJson{ return this.node.toJson(); }
	browseName?:IBrowseName;
	displayName:ILocalizedText;
	isForward?:boolean;
	node?:ExtendedNode;
	value?:Value;
	nodeClass?:ENodeClass;
	referenceType?:INode;
	typeDefinition?:IExtendedNode;
}