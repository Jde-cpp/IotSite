import { Inject, Injectable, computed, signal } from '@angular/core';
import { AppService } from 'jde-framework';
import { IotService } from '../services/iot.service';
import { EProvider, IAuth, LoggedInUser } from 'jde-material';

@Injectable()
export class IotAuthService implements IAuth{
	constructor( private app: AppService, @Inject('IotService') private iot: IotService )
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
		let promise = await this.isOpc() ? this.iot.logout() : this.app.logout();
		this.isOpc.set( null );
		return promise;
	}
	async loginPassword( domain:string, username:string, password:string ):Promise<void>{
		let promise = await this.iot.login( domain, username, password );
		this.isOpc.set( true );
		return promise;
	}
	user = computed( () => this.app?.user() );
		//this.isOpc()==null ? null : this.isOpc() ? this.iot.user() : this.app.user() );
	isOpc = signal<boolean|undefined>( null );
}