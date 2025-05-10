import { Injectable } from "@angular/core";
import { OpcServerTarget } from "../model/OpcServer";
import * as types from '../model/types';
import { NodeRoute } from "../model/NodeRoute";
import { DocItem } from "jde-material";

class StoreNode{
	constructor( node:types.Reference|types.ExpandedNode ){
		this.ref = node;
	}
	parent:types.NodeId;
	ref:types.Reference|types.ExpandedNode;
	children:types.NodeId[] = [];
}

type NodeId = string;
@Injectable({providedIn: 'root'})
export class OpcStore{
	constructor(){
		console.log( `OpcStore::OpcStore` );
	}
	private getNodes( opcId:OpcServerTarget ):Map<NodeId,StoreNode>{
		let nodes = this.#opcServers.get( opcId );
		if( !nodes )
			this.#opcServers.set( opcId, nodes = new Map<NodeId,StoreNode>() );
		return nodes;
	}
	private findStore( opcTarget:OpcServerTarget, nodeId:types.NodeId ):StoreNode{
		let opcNodes = this.#opcServers.get( opcTarget );
		let store:StoreNode;
		if( opcNodes )
			store = opcNodes.get( nodeId.toString() );
		return store;
	}
	private getStore( nodes:Map<NodeId,StoreNode>, node:types.ExpandedNode ):StoreNode{
		let store = nodes.get( node.id.toString() );
		if( !store )
			nodes.set( node.id.toString(), store = new StoreNode(node) );
		return store;
	}
	setOpcServers( servers: DocItem[]) {
		this.#opcServerRoutes = [...servers];
		for( let route of this.#opcServerRoutes )
			route.path = route.path.substring( route.path.lastIndexOf("/")+1 );
	}

	setReferences( opcId:OpcServerTarget, node:types.ExpandedNode, children:types.Reference[] ){
		let opcNodes = this.getNodes( opcId );
		let store = this.getStore( opcNodes, node );
		store.children = [];
		for( let child of children ){
			store.children.push( child.node.id );
			let childStore = this.getStore( opcNodes, child.node );
			childStore.parent = node.id;
			childStore.ref = child;
		}
	}
	setRoute(route: NodeRoute) {
		if( route.node.id == types.ENodes.ObjectsFolder ){
			route.siblings = this.#opcServerRoutes ?? [{title: route.opcTarget, path: route.opcTarget}];
			return;
		}
		const store = this.findStore( route.opcTarget, route.node.id );
		if( store?.parent ){
			const parentStore = this.findStore( route.opcTarget, store.parent );
			if( parentStore ){
				const parentRef = parentStore.ref;
				if( parentRef instanceof types.Reference )
					route.parent = { path: `${route.opcTarget}/${parentRef.node.id.toString()}`, title: parentRef.browseName.name.toString() };
				else if( parentRef.id == types.ENodes.ObjectsFolder ){
					let opcServer = this.#opcServerRoutes?.find( (r)=>r.path==route.opcTarget );
					route.parent = { path: route.opcTarget, title: opcServer ? opcServer.title : route.opcTarget };
				}
				route.siblings = [];
				for( const siblingId of parentStore.children ){
					const siblingStore = siblingId==route.node.id ? store : this.findStore( route.opcTarget, siblingId );
					const sibling = siblingStore?.ref as types.Reference;
					if( sibling instanceof types.Reference )
						route.siblings.push( {path: `${route.opcTarget}/${sibling.node.id.toString()}`, title: sibling.browseName.name.toString()} );
				}
			}
		}
	}

	#opcServerRoutes: DocItem[];
	#opcServers:Map<OpcServerTarget, Map<NodeId,StoreNode>> = new Map<OpcServerTarget, Map<NodeId,StoreNode>>();
}