import { Injectable } from '@angular/core';
import { DocItem, IRouteService } from "jde-material";
import { Routes, UrlSegment } from "@angular/router";

@Injectable( {providedIn: 'root'} )
export class OpcNodeRouteService implements IRouteService{
	constructor(){
		console.log( `OpcNodeRouteService::OpcNodeRouteService` );
	}
	async children():Promise<Routes>{
		throw new Error("Not implemented");
	}
	async docItems( urlSegments:UrlSegment[] ):Promise<DocItem[]>{
		debugger;
		return Promise.resolve( [] );
	}
}