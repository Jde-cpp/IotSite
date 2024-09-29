import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppService, AuthService } from 'jde-framework';
import { IotService } from '../services/iot.service';

@Injectable()
export class IotAuthService extends AuthService{
	constructor( app: AppService, @Inject('IotService') private iot: IotService ){
		super( app );
		iot.subscribeLoginName().subscribe({
			next:(login: string) =>{
				this.subscription.next( login );
			},
			error:(error: Error) =>{
				console.log( error.message );
				this.subscription.next( "" );
		}});
	}

	override loginPassword( domain:string, username:string, password:string ):Promise<void>{
		return this.loggedIn ? Promise.resolve() : this.iot.login( domain, username, password );
	}
}