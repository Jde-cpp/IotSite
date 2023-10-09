import { environment } from '../../../environments/environment';

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

export interface INode{
	ns:Namespace;
	nodeId:NodeId;
}
export type NodeJson = {ns?:number, nsu?:string,s?:string,i?:number,g?:string,b?:string};
export class Node implements INode{
	constructor( json:NodeJson ){
		this.ns =  json.ns ? +json.ns : undefined;
		if( json.i!==undefined )
			this.nodeId = +json.i;
		else if( json.s!==undefined )
			this.nodeId = json.s;
		else if( json.g!==undefined )
			this.nodeId = new Guid( json.g );
		else if( json.b!==undefined )
			this.nodeId = toBinary( json.b );
		else
			this.nodeId = environment.defaultNode;
	}
	toJson():NodeJson{
		let json:NodeJson = {};
		if( typeof this.ns === "number" )
			json.ns = this.ns;
		else
			json.nsu = this.ns;

		let idValue = this.nodeId;
		if( typeof this.nodeId === "number" )
			json.i = this.nodeId;
		else if( typeof this.nodeId === "string" )
			json.s = this.nodeId;
		else if( this.nodeId instanceof Guid )
			json.g = this.nodeId.toString();
		else if( this.nodeId instanceof Uint8Array )
			json.b = btoa( this.nodeId.reduce((acc, current) => acc + String.fromCharCode(current), "") );

		return json;
	}
	ns:number;
	nodeId:NodeId;
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
	constructor( json:{browseName:IBrowseName, displayName:ILocalizedText, isForward:boolean, node?:ExtendedNodeJson, nodeClass?:number, referenceType?:NodeJson, typeDefinition?:ExtendedNodeJson} ){
		this.browseName = json.browseName;
		this.displayName = json.displayName;
		this.isForward = json.isForward;
		this.node = new ExtendedNode( json.node );
		this.nodeClass = <ENodeClass>json.nodeClass;
		this.referenceType = new Node( json.referenceType );
		this.typeDefinition = new ExtendedNode( json.typeDefinition );
	}
	nodeParams():NodeJson{ return this.node.toJson(); }
	browseName?:IBrowseName;
	displayName:ILocalizedText;
	isForward?:boolean;
	node?:ExtendedNode;
	nodeClass?:ENodeClass;
	referenceType?:INode;
	typeDefinition?:IExtendedNode;
}