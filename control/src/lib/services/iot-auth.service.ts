import { Inject, Injectable, computed, signal } from '@angular/core';
import { AppService } from 'jde-framework';
import { GatewayService } from './gateway.service';
import { EProvider, IAuth, LoggedInUser } from 'jde-material';

@Injectable()
export class IotAuthService implements IAuth{
	constructor( private app: AppService, @Inject('GatewayService') private gatewayService: GatewayService )
	{}

	googleAuthClientId(): Promise<string> {
		return this.app.googleAuthClientId();
	}

	async login( user:LoggedInUser ):Promise<void>{
		let promise = await this.app.login( user );
		this.isOpc.set( false );
		return promise;
	}
	providers():Promise<EProvider[]>{ return this.app.providers(); }
	validateSessionId():void{ this.app.validateSessionId(); }

	async logout():Promise<void>{
		let promise;
		if( this.isOpc() )
			promise = await this.gatewayService.defaultGateway.logout();
		else
			promise = await this.app.logout();
		this.isOpc.set( null );
		return promise;
	}
	async loginPassword( domain:string, username:string, password:string ):Promise<void>{
		//let gateway = await	 this.gatewayService.instance( domain );
		let promise = await this.gatewayService.defaultGateway.login( domain, username, password );
		this.isOpc.set( true );
		return promise;
	}
	user = computed( () => this.app?.user() );
		//this.isOpc()==null ? null : this.isOpc() ? this.iot.user() : this.app.user() );
	isOpc = signal<boolean|undefined>( null );
//	iot = computed( () => this.isOpc() ? this.gatewayService.defaultGateway : null );
}