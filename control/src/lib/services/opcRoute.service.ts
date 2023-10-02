import { Inject, Injectable } from '@angular/core';
import { IRouteService } from "jde-material";
import { ActivatedRoute, Routes, Route } from "@angular/router";
import { IotService } from './iot.service';

@Injectable( {providedIn: 'root'} )
export class OpcRouteService implements IRouteService{
	constructor( @Inject('IotService') private _iot:IotService ){}
	async children():Promise<Routes>
	{
		let ql = await this._iot.query("query{ opcServers { id name deleted target description isDefault url } }" );
		let y = [];
		for( const s of ql["opcServers"] )
			y.push( { path: s.target, data: { name: s.name, summary: s.description } } );

		return y;
	}
}
