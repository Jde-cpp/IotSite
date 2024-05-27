import { Injectable, Inject } from '@angular/core';
import { IGraphQL, ProtoService, AppService } from 'jde-framework'; //Mutation, DateUtilities, IQueryResult
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject,Observable, finalize } from 'rxjs';
import { IErrorService } from 'jde-framework';
import { Jde } from 'jde-framework'; import FromServer = Jde.Web.FromServer;
import * as types from '../types/types';
import { Error } from '../types/Error';

import * as IotCommon from '../proto/IotCommon'; import Common = IotCommon.Jde.Iot.Proto;
import * as IotRequests from '../proto/IotFromClient'; import Requests = IotRequests.Jde.Iot.FromClient;
import * as IotResults from '../proto/IotFromServer'; import Results = IotResults.Jde.Iot.FromServer;

interface IError{ requestId:number; message: string; }
type Owner = any;

@Injectable( {providedIn: 'root'} )
export class IotService extends ProtoService<Requests.ITransmission,Results.IMessageUnion> implements IGraphQL{
	constructor( http: HttpClient, @Inject('AppService') public appService:AppService, @Inject('IErrorService') private cnsl: IErrorService ){
		super( Requests.Transmission, http );
		appService.iotInstances().then(
			(instances)=>{if(instances.length==0) console.error("No IotServies running");super.instances = instances;},
			(e:HttpErrorResponse)=>{debugger;console.error(`Could not get IotServices.  (${e.status})${e.message}`);}
		);
	}
	async login( domain:string, username:string, password:string ){
		let self = this;
		if( this.log.restRequests )	console.log( `Login( opc='${domain}', username='${username}' )` );
		this.setSessionId( await this.post<string>('Login', {opc:domain, user:username, password:password}) );
		if( this.log.restResults )	console.log( `sessionId='${self.sessionId}'` );
	}
	protected encode( t:Requests.Transmission ){ return Requests.Transmission.encode(t); }
	protected handleConnectionError(){};
	protected processMessage( buffer:protobuf.Buffer ){
		try{
			const transmission = Results.Transmission.decode( buffer );
			for( const message of <Results.MessageUnion[]>transmission.messages ){
				if( message.acknowledgement )
					this.setSessionId( message.acknowledgement.id );
				else if( message.nodeValues )
					this.nodeValues( message.nodeValues );
				else if( message.subscriptionAck )
					this.subscriptionAck( message.subscriptionAck );
				else if( message.unsubscribeResult )
					this.onUnsubscriptionResult( message.unsubscribeResult );
				else if( message.exception ){
					if( !this.processError(<IError>message.exception) )
						throw message.exception;
				}
				else
					throw `unknown message:  ${JSON.stringify( message[message.Value] )}`;
			}
		}
		catch( e ){
			if( typeof(e)==typeof(FromServer.Exception) ){
				const e2 = <FromServer.IException>e;
				console.error( `(${e2.requestId})${e2.message}` );
			}
			else
				console.error( e );
		}
	}
	private static toParams( obj:any ){
		let params="";
		Object.keys(obj).forEach( m=>{if(params.length)params+="&"; params+=`${m}=${obj[m]}`;} );
		return params;
	}
	private static toNode( proto:Common.INodeId ):types.Node{
		let node = new types.Node( {ns:proto.namespaceIndex} );
		if( proto.numeric )
			node.id = proto.numeric;
		else if( proto.string )
			node.id = proto.string;
		else if( proto.byteString )
			node.id = proto.byteString;
		else if( proto.guid )
			node.id = IotService.toGuid(proto.guid);
		return node;
	}
	private static toExpanded( proto:Common.IExpandedNodeId ):types.ExpandedNode{
		const en = new types.ExpandedNode( {nsu:proto.namespaceUri, serverIndex:proto.serverIndex} );
		const n = IotService.toNode(proto.node);
		en.id = n.id;
		en.ns = n.ns;
		return en;
	}

	private static toProto( nodes:types.ExpandedNode[] ):Common.IExpandedNodeId[]{
		let protoNodes = [];
		for( const node of nodes ){
			let proto = new Common.ExpandedNodeId();
			proto.namespaceUri = node.nsu;
			proto.serverIndex = node.serverIndex;
			proto.node = new Common.NodeId();
			proto.node.namespaceIndex = node.ns;
			if( typeof node.id === "number" )
				proto.node.numeric = node.id;
			else if( typeof node.id === "string" )
				proto.node.string = node.id;
			else if( node.id instanceof types.Guid )
				proto.node.guid = node.id.value;
			else if( node.id instanceof Uint8Array )
				proto.node.byteString = node.id;
			protoNodes.push( proto );
		}
		return protoNodes;
	}

	private async updateErrorCodes()
	{
		const scs = Error.emptyMessages();
		if( scs.length )
		{
			const json = await super.get( `ErrorCodes?scs=${scs.join(',')}` );
			Error.setMessages( json["errorCodes"] );
		}
	}
	public async browseObjectsFolder( opcId:string, node:types.ExpandedNode, snapshot:boolean ):Promise<types.Reference[]>{
		const json = await super.get(`BrowseObjectsFolder?opc=${opcId}&${IotService.toParams(node.toJson())}&snapshot=${snapshot}`);
		var y = [];
		for( const ref of json["references"] )
			y.push( new types.Reference(ref) );
		this.updateErrorCodes();
		return y;
	}
	async snapshot( opcId:string, nodes:types.ExpandedNode[] ):Promise<Map<types.ExpandedNode,types.Value>>{
		const args = encodeURIComponent( JSON.stringify(nodes.map(n=>n.toJson())) );
		const json = await super.get( `Snapshot?opc=${opcId}&nodes=${args}` );
		var y = new Map<types.ExpandedNode,types.Value>();
		for( const snapshot of json["snapshots"] )
			y.set( new types.ExpandedNode(snapshot.node), snapshot.value );
		this.updateErrorCodes();
		return y;
	}
	async write( opcId:string, n:types.ExpandedNode, v:types.Value ):Promise<types.Value>{
		const nodeArgs = encodeURIComponent( JSON.stringify([n.toJson()]) );
		const valueArgs = encodeURIComponent( JSON.stringify([v]) );
		const json = await super.get( `Write?opc=${opcId}&nodes=${nodeArgs}&values=${valueArgs}` );
		if( json["snapshots"][0].sc ){
			const e:Error = new Error( json["snapshots"][0].sc[0] );
			this.updateErrorCodes();
			throw e;
		}
		return types.toValue( json["snapshots"][0].value );
	}

	private onUnsubscriptionResult( result:Results.IUnsubscribeResult ){
		result.failures?.forEach( (node)=>console.log(`unsubscribe failed for:  ${IotService.toExpanded(node).toJson()}`) );
		this._callbacks.get( result.requestId ).resolve( null );
	}

	private subscriptionAck( ack:Results.ISubscriptionAck ){
		this._callbacks.get( ack.requestId ).resolve( ack.results );
	}

	private async _subscribe( opcId:types.OpcId, nodes:types.ExpandedNode[], subject:Subject<SubscriptionResult> ):Promise<void>{
		const requestId = this.nextRequestId;
		const request:Requests.ISubscribe = { nodes:IotService.toProto(nodes), opcId:opcId, requestId:requestId };
		let toDelete = new Array<types.ExpandedNode>();
		try{
		 	let y = await this.sendPromise<Requests.ISubscribe,Results.IMonitoredItemCreateResult[]>( "subscribe", request );
		 	for( let i=0; i<y.length; ++i ){
				const node = nodes[i];
				if( y[i].statusCode ){
					toDelete.push( node );
					let e = new Error( y[i].statusCode );
					console.log( `Subscription failed for '${node}' - ${e}` );
					//subject.error( {node:node,error:e} );  closes the subscription.
				}
		 	}
		}
		catch( e ){
			console.error( e["error"]["message"] );
			toDelete.push( ...nodes );
			subject.error( e );
		}
		toDelete.forEach( (n)=>this.getOpcSubscriptions(opcId).delete(n.key) );
	}

	#ownerSubscriptions = new Map<Owner,Subject<SubscriptionResult>>();
	#subscriptions = new Map<types.OpcId,Map<types.NodeKey, Owner[]>>();
	getOpcSubscriptions(opcId:types.OpcId):Map<types.NodeKey, Owner[]>{ return this.#subscriptions.has( opcId ) ? this.#subscriptions.get( opcId ) : this.#subscriptions.set( opcId, new Map<types.NodeKey, Owner[]> ).get( opcId ); }
	#nodes = new Map<types.NodeKey, types.ExpandedNode>();
	private clearUnusedNodes(){
		this.#nodes.forEach( (_, key)=>{
			const keys = [...this.#subscriptions.entries()].filter( ({1:value})=>value.has(key) ).map( ([key])=>key );
			if( !keys.length )
				this.#nodes.delete(key);
		});
	}
	public addToSubscription( opcId:types.OpcId, nodes:types.ExpandedNode[], owner:Owner ){
		let opcSubscriptions = this.getOpcSubscriptions( opcId );
		for( const node of nodes ){
			let owners:Owner[];
			if( opcSubscriptions.has(node.key) ){
				let owners = opcSubscriptions.get( node.key );
				if( !owners.includes(owner) )
					owners.push( owner );
			}
			else{
				opcSubscriptions.set( node.key, [owner] ).get( node.key );
				this.#nodes.set( node.key, node );
			} 
		}
		let subject = this.#ownerSubscriptions.has( owner ) ? this.#ownerSubscriptions.get( owner ) : this.#ownerSubscriptions.set( owner, new Subject<SubscriptionResult>() ).get( owner );
		this._subscribe( opcId, nodes, subject );
	}
	subscribe( opcId:types.OpcId, nodes:types.ExpandedNode[], owner:Owner ):Observable<SubscriptionResult>{
		this.addToSubscription( opcId, nodes, owner );
		let subject = this.#ownerSubscriptions.get( owner );
		return subject.pipe(
			finalize(() => {//https://stackoverflow.com/questions/62579473/detect-when-a-subject-has-no-more-subscriptions
				if( !subject.observers.length ) {
					this.clearOwner( owner );
				}
			}));
	}

	private static toGuid( proto:Uint8Array ):types.Guid{ let guid = new types.Guid(); guid.value = proto; return guid; }
	private static toValue( proto:Results.IValue ):types.Value{
		let v:types.Value;
		if( proto.boolean )
			v = proto.boolean;
		else if( proto.byte )
			v = proto.byte;
		else if( proto.byteString )
			v = proto.byteString;
		else if( proto.date )
			v = <types.Timestamp>proto.date;
		else if( proto.doubleValue )
			v = proto.doubleValue;
		else if( proto.duration )
			v = <types.Duration>proto.duration;
		else if( proto.expandedNode )
			v = IotService.toExpanded( proto.expandedNode );
		else if( proto.floatValue )
			v = proto.floatValue;
		else if( proto.guid )
			v = IotService.toGuid( proto.guid );
		else if( proto.int16 )
			v = proto.int16;
		else if( proto.int32 )
			v = proto.int32;
		else if( proto.int64 )
			v = proto.int64;
		else if( proto.node )
			v = IotService.toNode(proto.node);
		else if( proto.sbyte )
			v = proto.sbyte;
		else if( proto.statusCode )
			v = proto.statusCode;
		else if( proto.stringValue )
			v = proto.stringValue;
		else if( proto.uint16 )
			v = proto.uint16;
		else if( proto.uint32 )
			v = proto.uint32;
		else if( proto.uint64 )
			v = proto.uint64;
		else if( proto.xmlElement )
			v = proto.xmlElement;
		return v;
	}
	private static toValues( proto:Results.IValue[] ):types.Value{
		let value = proto.length==1 ? IotService.toValue( proto[0] ) : new Array<types.Value>();
		if( proto.length>1 )
			proto.forEach( v => (<types.Value[]>value).push( IotService.toValue(v) ) );
		return value;
	}

	private nodeValues( nodeValues:Results.INodeValues ):void{
		let opcSubscriptions = this.#subscriptions.get( nodeValues.opcId ); if( !opcSubscriptions ){ return console.error(`Could not find opc ${nodeValues.opcId}`);}
		const node = IotService.toExpanded( nodeValues.node );
		opcSubscriptions.get( node.key )?.forEach( owner=>this.#ownerSubscriptions.get(owner).next({opcId:nodeValues.opcId, node:node, value:IotService.toValues(nodeValues.values)}) );
	};

	private clearOwnerNode( opcSubscriptions:Map<types.NodeKey, Owner[]>,  key:types.NodeKey, owner:Owner ){
		let owners = opcSubscriptions.get( key );
		const index = owners.indexOf( owner );
		let tombStone = false;
		if( index!=-1 ){
			owners.splice( index, 1 );
			tombStone = !owners.length
			if( tombStone )
				opcSubscriptions.delete( key );
		}
		return tombStone;
	}
	// remove all subscriptions for owner.
	private clearOwner( owner:Owner ){
		this.#ownerSubscriptions.delete( owner );
		let toDeleteKeys = new Map<types.OpcId,types.NodeKey[]>();
		for( const [opcId, opcSubscriptions] of this.#subscriptions.entries() ){
			for( const nodeKey of opcSubscriptions.keys() ){
				if( this.clearOwnerNode(opcSubscriptions, nodeKey, owner) )
				toDeleteKeys.has(opcId) ? toDeleteKeys.get(opcId).push(nodeKey) : toDeleteKeys.set( opcId, [nodeKey] );
			}
		}
		let toDeleteNodes = new Map<types.OpcId,types.ExpandedNode[]>();
		for( const [opcId,keys] of toDeleteKeys ){
			let nodes = toDeleteNodes.set( opcId, [] ).get( opcId );
			keys.forEach( key=>nodes.push( this.#nodes.get(key) ) );
		}
		if( toDeleteNodes.size ){
			for( const [opcId, nodes] of toDeleteNodes ){
				const requestId = this.nextRequestId;
				var request:Requests.IUnsubscribe = { nodes:IotService.toProto(nodes), opcId:opcId, requestId:requestId };
				this.sendPromise<Requests.IUnsubscribe,void>( "unsubscribe", request );
			}
		}
		this.clearUnusedNodes();
	}
	// Unsuscribe, but keep subscription open.
	async unsubscribe( opcId:string, nodes:types.ExpandedNode[], owner:Owner ):Promise<void>{
		let opcSubscriptions = this.#subscriptions.get( opcId ); //if( !opcSubscriptions ){ return console.error(`Could not find opc ${opcId}`);}
		let toDelete = new Array<types.ExpandedNode>();
		for( const node of nodes ){
			if( this.clearOwnerNode( opcSubscriptions, node.key, owner ) )
				toDelete.push( node );
		}

		this.clearUnusedNodes();
		if( toDelete.length ){
			const requestId = this.nextRequestId;
			var request:Requests.IUnsubscribe = { nodes:IotService.toProto(toDelete), opcId:opcId, requestId:requestId };
			return this.sendPromise<Requests.IUnsubscribe,void>( "unsubscribe", request );
		}
		else
			return Promise.resolve();
	}
}
export type SubscriptionResult = {opcId:string, node:types.ExpandedNode,value:types.Value};
