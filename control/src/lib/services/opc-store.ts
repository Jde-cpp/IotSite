import { Injectable } from "@angular/core";
import { CnnctnTarget } from "../model/ServerCnnctn";
import * as types from '../model/types';
import { NodeRoute } from "../model/NodeRoute";
import { UaNode } from "../model/Node";
import { NodeId, NodeIdJson } from "../model/NodeId";
import { DocItem } from "jde-material";
import { GatewayTarget } from "./gateway.service";

class StoreNode{
	constructor( node:UaNode ){
		this.ref = node;
	}
	parent:NodeId;
	ref:UaNode;
	children:UaNode[] = [];
}

@Injectable({providedIn: 'root'})
export class OpcStore{
	constructor(){
		console.log( `OpcStore::OpcStore` );
	}
	private getNodes( gateway:GatewayTarget, cnnctn:CnnctnTarget ):Map<types.NodeKey,StoreNode>{
		let gatewayNodes = this.#nodes.get( gateway );
		if( !gatewayNodes )
			this.#nodes.set( gateway, gatewayNodes = new Map<CnnctnTarget, Map<types.NodeKey,StoreNode>>() );
		let nodes = gatewayNodes.get( cnnctn );
		if( !nodes )
			gatewayNodes.set( cnnctn, nodes = new Map<types.NodeKey,StoreNode>() );
		return nodes;
	}
	private findStore( gateway:GatewayTarget, cnnctn:CnnctnTarget, node:NodeId ):StoreNode{
		const opcNodes = this.#nodes.get( gateway )?.get( cnnctn );
		let store:StoreNode;
		if( opcNodes )
			store = opcNodes.get( node.key );
		return store;
	}
	private getStore( nodes:Map<types.NodeKey,StoreNode>, node:UaNode ):StoreNode{
		let store = nodes.get( node.nodeId.key );
		if( !store )
			nodes.set( node.nodeId.key, store = new StoreNode(node) );
		return store;
	}
	setServerCnnctns( clients: DocItem[] ){
		this.#serverCnnctnRoutes = [...clients];
		for( let route of this.#serverCnnctnRoutes )
			route.path = route.path.substring( route.path.lastIndexOf("/")+1 );
	}

	setNodes( gateway:GatewayTarget, cnnctn:CnnctnTarget, node:UaNode, children:UaNode[] ){
		let opcNodes = this.getNodes( gateway, cnnctn );
		let store = this.getStore( opcNodes, node );
		store.children = [];
		for( let child of children ){
			store.children.push( child );
			let childStore = this.getStore( opcNodes, child );
			childStore.parent = node.nodeId;
			childStore.ref = child;
		}
	}
	setRoute(route: NodeRoute) {
		if( route.nodeId.id == types.ENodes.ObjectsFolder ){
			route.siblings = [new DocItem({title: route.cnnctnTarget, path: route.cnnctnTarget})]; //TODO add all connections.
			return;
		}
		let findStore = (node:NodeId):StoreNode => { return this.findStore( route.gatewayTarget, route.cnnctnTarget, node ); };
		const store = findStore( route.nodeId );
		if( store?.parent ){
			const parentStore = findStore( store.parent );
			if( parentStore ){
				const parentRef = parentStore.ref;
				if( parentRef instanceof UaNode )
					route.parent = new DocItem( {path: route.cnnctnTarget, queryParams: parentRef.nodeId.toJson(), title: parentRef.browseName?.name.toString()} );
				// else if( parentRef.id == types.ENodes.ObjectsFolder ){
				// 	let opcServer = this.#serverCnnctnRoutes?.find( (r)=>r.path==route.cnnctnTarget );
				// 	route.parent = new DocItem( {path: route.cnnctnTarget, title: opcServer ? opcServer.title : route.cnnctnTarget} );
				// }
				route.siblings = [];
				for( const sibling of parentStore.children ){
					const siblingStore = sibling.nodeId.key == route.nodeId.key ? store : findStore( sibling.nodeId );
					const siblingRef = siblingStore?.ref as UaNode;
					if( siblingRef instanceof UaNode && siblingRef.nodeId )
						route.siblings.push( new DocItem( {path: route.cnnctnTarget, queryParams: siblingRef.nodeId.toJson(), title: siblingRef.browseName.name.toString()} ) );
				}
			}
		}
	}
	findNodeId( gateway:string, cnnctnTarget:string, browsePath:string ): UaNode {
		let uaNode: UaNode;
		let nodes = this.getNodes(gateway, cnnctnTarget);
		let storeNode: StoreNode = nodes.get( UaNode.rootNode.nodeId.key );
		if( !storeNode )
			return uaNode;
		browsePath.split("/").forEach( (segment, i)=>{
			uaNode = storeNode.children.find( (c)=>c.browseName.name.toString() == segment );
			if( uaNode )
				storeNode = this.findStore( gateway, cnnctnTarget, uaNode.nodeId );
		} );
		return uaNode;
	}

	#serverCnnctnRoutes: DocItem[];
	#nodes = new Map<GatewayTarget,Map<CnnctnTarget, Map<types.NodeKey,StoreNode>>>();
}