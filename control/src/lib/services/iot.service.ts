import { Injectable, Inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Table, IGraphQL, Mutation, DateUtilities, IQueryResult } from 'jde-framework';
import { IAuth } from 'jde-material';
import { IErrorService, ProtoUtilities } from 'jde-framework';

type TransformInput = (x:any)=>any;
type Resolve = (x:any)=>void;
type Reject = (x:Results.IError)=>void;

interface IStringRequest<T>{ id:number; type:T; value:string; }
interface IStringResult{ id:number; value:string; }
interface IMessageUnion{ stringResult:IStringResult }
interface IError{ requestId:number; message: string; }

class RequestPromise<ResultMessage>
{
	constructor( public result:(ResultMessage)=>any, public resolve:Resolve, public reject:Reject, public transformInput:TransformInput=null )
	{}
}



abstract class ProtoService<Transmission,ResultMessage>
{
	constructor( private TCreator: { new (): Transmission; } ){
	}
	connect():void
	{
		this.#socket = webSocket<protobuf.Buffer>( {url: 'ws://localhost:6813', deserializer: msg => this.onMessage(msg), serializer: msg=>msg, binaryType:"arraybuffer"} );
		this.#socket.subscribe(
			( msg ) => this.addMessage( msg ),
			( err ) => this.error( err ),
			() => this.socketComplete()
		);
	}
	addMessage( msg )
	{}
	error( err )
	{
	//	debugger;
		this.sessionId = null;
		console.log( "No longer connected to Server.", err );
		this.handleConnectionError();
	}
	sendTransmission( t:Transmission ){	this.#socket.next( this.encode(t).finish() ); }
	send<T>( request:T ):void
	{
		let t = new this.TCreator(); t["messages"].push( request );
		if( !this.sessionId )
		{
			this.backlog.push( t );
			this.connect();
		}
		else
			this.sendTransmission( t );
	}
	sendPromise<TInput,TResult>( param:string, value:TInput, result:(ResultMessage)=>any, transformInput?:TransformInput ):Promise<TResult>
	{
		this.send( new Requests.MessageUnion( <Requests.IMessageUnion>{[param]: value}) );
		return new Promise<TResult>( ( resolve, reject )=>
		{
			this.#callbacks.set( value["requestId"], new RequestPromise(result, resolve, reject, transformInput) );//todo also do a proper rejection
		});
	}
	sendStringPromise<ERequest,TResult>( e:ERequest, value:string, transform:(string)=>any ):Promise<TResult>
	{
		const id = this.getRequestId();
		//if( this.log.results ) console.log( `(${id})${ERequest[q]}( ${value} )` );
		if( this.log.requests ) console.log( `(${id})${e[<number><unknown>e]}( ${value} )` );

		return this.sendPromise<IStringRequest<ERequest>,TResult>( "stringRequest", {id: id, type: e, value: value}, (x:ResultMessage)=>x["stringResult"], transform );
	}

	query<T>( ql: string ):Promise<T>
	{
		//return this.sendStringPromise<Requests.ERequest,T>( this.queryId, ql, (x:string)=>x ? JSON.parse(x).data : null );
		const id = this.getRequestId();
		if( this.log.requests ) console.log( `(${id})query( ${ql} )` );
		return this.sendPromise<Requests.IGraphQL,T>( "query", {requestId: id, query: ql}, (x:ResultMessage)=>x["stringResult"], (x:string)=>x ? JSON.parse(x).data : null );
	}
	schema( names:string[] ):Promise<Table[]>
	{
		return new Promise<Table[]>( (resolve, reject)=>
		{
			let results = new Array<Table>();
			let query =  new Array<string>();
			names.forEach( (x)=>{ if( ProtoService.#tables.has(x) ) results.push(ProtoService.#tables.get(x)); else query.push(x); } );
			if( !query.length )
				resolve( results );
			else
			{
				for( let name of query )
				{
					let ql = `{ __type(name: "${name}") { fields { name type { name kind ofType{name kind} } } } }`;
					this.query( ql ).then( ( data:any )=>
					{
						let table = new Table( data.__type );
						ProtoService.#tables.set( name, table );
						if( results.push( table )==names.length )
							resolve( results );
					}).catch( (e)=>reject(e) );
				}
			}
		});
	}
	mutations():Promise<Mutation[]>
	{
		return new Promise<Mutation[]>( (resolve, reject)=>
		{
			if( ProtoService.#mutations )
				resolve( ProtoService.#mutations );
			else
			{
				let ql = `query{__schema{mutationType{name fields { name args { name defaultValue type { name } } } } }`;
				this.query( ql ).then( ( data:any )=>
				{
					ProtoService.#mutations = data.__schema.fields;
					resolve( ProtoService.#mutations );
				}).catch( (e)=>reject(e) );
			}
		});
	}

	socketComplete(){ console.log( 'complete' ); }
	getRequestId(){ return ++this.#requestId;} #requestId=0;
	setSessionId( sessionId )
	{
		this.sessionId = sessionId;
		for( var m of this.backlog )
			this.sendTransmission( m );
		this.backlog.length=0;
	}
	onMessage( event:MessageEvent ):protobuf.Buffer
	{
		const m = new Uint8Array( event.data );
		this.processMessage( m );
		return m;
	}
	processCallback( id:number, resolution:any, log:string )
	{
		if( !this.#callbacks.has(id) )
			throw `no callback for:  '${id}'`;
		if( this.log.results ) console.log( `(${id})${log}` );
		let p:RequestPromise<ResultMessage> = this.#callbacks.get( id );
		p.resolve( resolution );
		this.#callbacks.delete( id );
	}
	processError( e:IError ):boolean
	{
		const id = e.requestId;
		const handled = this.#callbacks.has( id );
		if( handled )
		{
			let p:RequestPromise<ResultMessage> = this.#callbacks.get( id );
			p.reject( e );
			this.#callbacks.delete( id );
		}
		return handled;
	}
	abstract processMessage( bytearray:protobuf.Buffer );

	abstract handleConnectionError();
	abstract encode( t:Transmission );

	protected backlog:Transmission[] = [];
	protected log = { requests:true, results:true };
	protected sessionId:number;
	//abstract get queryId():number;
	#socket:WebSocketSubject<protobuf.Buffer>;
	#callbacks = new Map<number, RequestPromise<ResultMessage>>();
	static #tables = new Map<string,Table>();
	static #mutations:Array<Mutation>;
}

import * as IotRequests from 'jde-cpp/IotFromClient'; import Requests = IotRequests.Jde.Iot.FromClient;
import * as IotResults from 'jde-cpp/IotFromServer'; import Results = IotResults.Jde.Iot.FromServer;


@Injectable( {providedIn: 'root'} )
export class IotService extends ProtoService<Requests.ITransmission,Results.IMessageUnion> implements IGraphQL
{
	constructor( @Inject('IAuth') public authorizationService:IAuth, @Inject('IErrorService') private cnsl: IErrorService )
	{
		super( Requests.Transmission );
	}
	encode( t:Requests.Transmission ){ return Requests.Transmission.encode(t); }
	handleConnectionError(){};
	processMessage( buffer:protobuf.Buffer )
	{
		try
		{
			const transmission = Results.Transmission.decode( buffer );
			for( const message of <Results.MessageUnion[]>transmission.messages )
			{
				if( message.acknowledgement )
					this.setSessionId( message.acknowledgement.id );
				else if( message.stringResult )
					console.log( message.stringResult );
				else if( message.query )
					this.processCallback( message.query.requestId, JSON.parse(message.query.result).data, `graphQL length=${message.query.result.length}` );
				else if( message.error )
				{
					if( !this.processError(<IError>message.error) )
						throw message.error;
				}
				else
					throw `unknown message:  ${JSON.stringify( message[message.Value] )}`;
			}
		}
		catch( e )
		{
			if( typeof(e)==typeof(Results.Error) )
			{
				const e2 = <Results.IError>e;
				console.error( `(${e2.requestId})${e2.message}` );
			}
			else
				console.error( e );
		}
	}

	//get queryId(){ return Requests.ERequest.Query; }
}