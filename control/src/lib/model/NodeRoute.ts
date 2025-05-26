import { DocItem } from "jde-material";
import * as types from './types';
import { OpcServerTarget } from "./OpcServer";
import { ActivatedRouteSnapshot } from "@angular/router";
import { Sort } from "@angular/material/sort";
import { IProfile, Settings } from "jde-framework";

export class NodeRoute implements DocItem{
	constructor( private route:ActivatedRouteSnapshot, profileService: IProfile ){
		this.node = new types.ExpandedNode( Object.keys(route.queryParams).length ? route.queryParams : {i:types.ENodes.ObjectsFolder} );
		this.settings = new Settings<UserProfile>( UserProfile, this.profileKey, profileService );
	}

	get path(): string{ return this.route.url.map(seg=>seg.path).join("/"); }
	get title(): string{ return this.route.title; }
	collectionName=null;
	node: types.ExpandedNode;
	summary=null;
	parent: DocItem;
	siblings: DocItem[];
	get profileKey():string{ return `${this.opcTarget}.${this.node.id}`; }
	get profile():UserProfile{ return this.settings.value };
	settings:Settings<UserProfile>;
	children: DocItem[];
	excludedColumns?: string[]=[];
	get opcTarget():OpcServerTarget{ return this.route.paramMap.get("target"); }
}
export class UserProfile{
	assign( value:UserProfile ){ this.sort = value.sort; this.columns = value.columns; this.visibleColumns=value.visibleColumns; }
	sort:Sort = {active: "name", direction: "asc"};
	visibleColumns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	columns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	subscriptions:types.ExpandedNode[] = [];
}