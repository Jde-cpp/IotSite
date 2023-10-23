import { Injectable, Inject } from '@angular/core';
import { IGraphQL, ProtoService, AppService } from 'jde-framework'; //Mutation, DateUtilities, IQueryResult
import { HttpClient } from '@angular/common/http';
import { IErrorService, ProtoUtilities } from 'jde-framework';
//import { environment } from '../../../environments/environment';
import * as types from '../types/types';
import {Error} from '../types/Error';

interface IStringRequest<T>{ id:number; type:T; value:string; }
interface IStringResult{ id:number; value:string; }
interface IMessageUnion{ stringResult:IStringResult }
interface IError{ requestId:number; message: string; }

import * as IotRequests from 'jde-cpp/IotFromClient'; import Requests = IotRequests.Jde.Iot.FromClient;
import * as IotResults from 'jde-cpp/IotFromServer'; import Results = IotResults.Jde.Iot.FromServer;
import { HttpErrorResponse } from '@angular/common/http';


@Injectable( {providedIn: 'root'} )
export class IotService extends ProtoService<Requests.ITransmission,Results.IMessageUnion> implements IGraphQL
{
	constructor( http: HttpClient, @Inject('AppService') public appService:AppService, @Inject('IErrorService') private cnsl: IErrorService )
	{
		super( Requests.Transmission, http );
		appService.iotInstances().then(
			(instances)=>{if(instances.length==0) console.error("No IotServies running");super.instances = instances},
			(e:HttpErrorResponse)=>{debugger;console.error(`Could not get IotServices.  (${e.status})${e.message}`);}
		);
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
//				else if( message.stringResult )
//					console.log( message.stringResult );
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
	toParams( obj:any )
	{
		let params="";
		Object.keys(obj).forEach( m=>{if(params.length)params+="&"; params+=`${m}=${obj[m]}`;} );
		return params;
	}
	async updateErrorCodes()
	{
		const scs = Error.emptyMessages();
		if( scs.length )
		{
			const json = await super.get( `ErrorCodes?scs=${scs.join(',')}` );
			Error.setMessages( json["errorCodes"] );
		}
	}
	async browseObjectsFolder( opcId:string, node:types.ExtendedNode, snapshot:boolean ):Promise<types.Reference[]>{
		const json = await super.get(`BrowseObjectsFolder?opc=${opcId}&${this.toParams(node.toJson())}&snapshot=${snapshot}`);
		var y = [];
		for( const ref of json["references"] )
			y.push( new types.Reference(ref) );
		this.updateErrorCodes();
		return y;
	}
	async snapshot( opcId:string, nodes:types.ExtendedNode[] ):Promise<Map<types.ExtendedNode,types.Value>>
	{
		const args = encodeURIComponent( JSON.stringify(nodes.map(n=>n.toJson())) );
		const json = await super.get( `Snapshot?opc=${opcId}&nodes=${args}` );
		var y = new Map<types.ExtendedNode,types.Value>();
		for( const snapshot of json["snapshots"] )
			y.set( new types.ExtendedNode(snapshot.node), snapshot.value );
		this.updateErrorCodes();
		return y;
	}
	//get queryId(){ return Requests.ERequest.Query; }
}