import { inject, Inject, Injectable } from '@angular/core';
import { DocItem, IRouteService } from "jde-material";
import { Routes, UrlSegment } from "@angular/router";
import { IotService } from './iot.service';
import { OpcStore } from './opc-store';

@Injectable( {providedIn: 'root'} )
export class OpcRouteService implements IRouteService{
	constructor( @Inject('IotService') private _iot:IotService ){}
	async children():Promise<Routes>{
		throw new Error("Not implemented");
	}
	async docItems( urlSegments:UrlSegment[] ):Promise<DocItem[]>{
		let ql = await this._iot.query("gatewayClients { id name deleted target description isDefault url }" );
		let y = [];
		for( const s of ql["gatewayClients"] )
			y.push( {id: s.target, path: '/gatewayClients/'+s.target, title: s.name, summary: s.description} );

		this.#store.setOpcClients( y );
		return y;
	}
	#store = inject( OpcStore )
}