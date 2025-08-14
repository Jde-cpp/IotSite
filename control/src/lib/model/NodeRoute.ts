import { DocItem } from "jde-material";
import * as types from './types';
import {NodeId} from './NodeId';
//import { ServerCnnctnTarget } from "./ServerCnnctn";
import { ActivatedRouteSnapshot, Params } from "@angular/router";
import { Sort } from "@angular/material/sort";
import { IProfile, Settings } from "jde-framework";
import { OpcStore } from "../services/opc-store";
import { UaNode } from "./Node";
import { Inject } from "@angular/core";

export class NodeRoute extends DocItem{
	constructor( activatedRoute:ActivatedRouteSnapshot, profileService: IProfile, @Inject("OpcStore") opcStore:OpcStore ){
		super();
		let paramsRoute = activatedRoute.pathFromRoot.find( (r)=>r.paramMap.get("host") );
		this.gatewayTarget = paramsRoute?.paramMap.get("host");
		this.cnnctnTarget = paramsRoute?.paramMap.get("connection");
		this.route = activatedRoute.pathFromRoot[activatedRoute.pathFromRoot.length-1];
		this.node = this.browsePath.length ? opcStore.findNodeId( this.gatewayTarget, this.cnnctnTarget, this.browsePath ) :  UaNode.rootNode;
		this.settings = new Settings<UserProfile>( UserProfile, this.profileKey, profileService );
	}

	route: ActivatedRouteSnapshot;
	override get path(): string{
		return this.route.url.map(seg=>seg.path).join("/");
	}
	override get title(): string{ return this.route.title; }
	override get queryParams():Params{ return this.route.queryParams; }
	collectionName=null;
	node: UaNode;
	get nodeId():NodeId{ return this.node?.nodeId; }
	get browsePath():string{
		return this.route.url.map(seg=>seg.path).join("/");
	}
	get profileKey():string{ return this.nodeId?.toString(); }
	get profile():UserProfile{ return this.settings.value };
	settings:Settings<UserProfile>;
	children: DocItem[];
	//get cnnctnTarget():ServerCnnctnTarget{ return this.route.paramMap.get("target"); }
	cnnctnTarget:string;
	gatewayTarget:string;
}
export class UserProfile{
	assign( value:UserProfile ){ this.sort = value.sort; this.columns = value.columns; this.visibleColumns=value.visibleColumns; }
	sort:Sort = {active: "name", direction: "asc"};
	visibleColumns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	columns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	subscriptions:NodeId[] = [];
}