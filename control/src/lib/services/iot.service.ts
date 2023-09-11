import { Injectable, Inject } from '@angular/core';
import { IGraphQL, ProtoService, AppService } from 'jde-framework'; //Mutation, DateUtilities, IQueryResult
//import { IAu th } from 'jde-material';
import { IErrorService, ProtoUtilities } from 'jde-framework';
//import { environment } from '../../../environments/environment';

interface IStringRequest<T>{ id:number; type:T; value:string; }
interface IStringResult{ id:number; value:string; }
interface IMessageUnion{ stringResult:IStringResult }
interface IError{ requestId:number; message: string; }

import * as IotRequests from 'jde-cpp/IotFromClient'; import Requests = IotRequests.Jde.Iot.FromClient;
import * as IotResults from 'jde-cpp/IotFromServer'; import Results = IotResults.Jde.Iot.FromServer;


@Injectable( {providedIn: 'root'} )
export class IotService extends ProtoService<Requests.ITransmission,Results.IMessageUnion> implements IGraphQL
{
	constructor( @Inject('AppService') public appService:AppService, @Inject('IErrorService') private cnsl: IErrorService )
	{
		super( Requests.Transmission, appService.iotServerUrl() );
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

	//get queryId(){ return Requests.ERequest.Query; }
}