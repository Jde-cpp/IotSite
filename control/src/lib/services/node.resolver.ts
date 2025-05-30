import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IErrorService, IProfile, Settings, TableSchema } from 'jde-framework';
import { IotService, OpcNodeRouteService } from 'jde-iot';
import * as types from '../model/types';
import { NodeRoute, UserProfile } from '../model/NodeRoute';

export type NodePageData = {
	route:NodeRoute;
	references:types.Reference[];
};
@Injectable()
export class NodeResolver implements Resolve<NodePageData> {
	constructor( private route: ActivatedRoute, private router:Router, @Inject('IProfile') private profileService: IProfile, @Inject('IErrorService') private snackbar: IErrorService, @Inject('IotService') private iot:IotService ){}

	async load( route:NodeRoute ):Promise<NodePageData>{
		try{
			await route.settings.loadedPromise;
			let references = await this.iot.browseObjectsFolder( route.opcTarget, route.node, true );
			this.iot.setRoute( route );
			return { route: route, references: references };
		}catch( e ){
			this.snackbar.error( `Not found:  '${route.opcTarget}/${route.node.toJson()}'`, e );
			this.router.navigate( ['..'], { relativeTo: this.route } );
			return null;
		}
	}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Promise<NodePageData>{
		return this.load( new NodeRoute(route, this.profileService) );
	}
}