import { Injectable } from "@angular/core";
import { OpcServerTarget } from "../model/OpcServer";
import * as types from '../model/types';
import { NodeRoute } from "../model/NodeRoute";
import { DocItem } from "jde-material";

class StoreNode{
	constructor( node:types.Reference|types.ExpandedNode ){
		this.ref = node;
	}
	parent:types.Node;
	ref:types.Reference|types.ExpandedNode;
	children:types.NodeJson[] = [];
}

type NodeId = string; //stringify(NodeJson)
@Injectable({providedIn: 'root'})
export class OpcStore{
	constructor(){
		console.log( `OpcStore::OpcStore` );
	}
	private getNodes( opcId:OpcServerTarget ):Map<NodeId,StoreNode>{
		let nodes = this.#opcClients.get( opcId );
		if( !nodes )
			this.#opcClients.set( opcId, nodes = new Map<NodeId,StoreNode>() );
		return nodes;
	}
	private findStore( opcTarget:OpcServerTarget, node:types.NodeJson ):StoreNode{
		let opcNodes = this.#opcClients.get( opcTarget );
		let store:StoreNode;
		if( opcNodes )
			store = opcNodes.get( JSON.stringify(node) );
		return store;
	}
	private getStore( nodes:Map<NodeId,StoreNode>, node:types.ExpandedNode ):StoreNode{
		const key = JSON.stringify( node.toJson() );
		let store = nodes.get( key );
		if( !store )
			nodes.set( key, store = new StoreNode(node) );
		return store;
	}
	setOpcClients( clients: DocItem[]) {
		this.#opcClientRoutes = [...clients];
		for( let route of this.#opcClientRoutes )
			route.path = route.path.substring( route.path.lastIndexOf("/")+1 );
	}

	setReferences( opcId:OpcServerTarget, node:types.ExpandedNode, children:types.Reference[] ){
		let opcNodes = this.getNodes( opcId );
		let store = this.getStore( opcNodes, node );
		store.children = [];
		for( let child of children ){
			store.children.push( child.node.toJson() );
			let childStore = this.getStore( opcNodes, child.node );
			childStore.parent = node;
			childStore.ref = child;
		}
	}
	setRoute(route: NodeRoute) {
		if( route.node.id == types.ENodes.ObjectsFolder ){
			route.siblings = this.#opcClientRoutes ?? [new DocItem({title: route.opcTarget, path: route.opcTarget})];
			return;
		}
		const store = this.findStore( route.opcTarget, route.node.toJson() );
		if( store?.parent ){
			const parentStore = this.findStore( route.opcTarget, store.parent.toJson() );
			if( parentStore ){
				const parentRef = parentStore.ref;
				if( parentRef instanceof types.Reference )
					route.parent = new DocItem( {path: route.opcTarget, queryParams: parentRef.node.toJson(), title: parentRef.browseName.name.toString()} );
				else if( parentRef.id == types.ENodes.ObjectsFolder ){
					let opcServer = this.#opcClientRoutes?.find( (r)=>r.path==route.opcTarget );
					route.parent = new DocItem( {path: route.opcTarget, title: opcServer ? opcServer.title : route.opcTarget} );
				}
				route.siblings = [];
				for( const sibling of parentStore.children ){
					const siblingStore = new types.Node(sibling).equals( route.node ) ? store : this.findStore( route.opcTarget, sibling );
					const siblingRef = siblingStore?.ref as types.Reference;
					if( siblingRef instanceof types.Reference && siblingRef.node )
						route.siblings.push( new DocItem( {path: route.opcTarget, queryParams: siblingRef.node.toJson(), title: siblingRef.browseName.name.toString()}) );
				}
			}
		}
	}

	#opcClientRoutes: DocItem[];
	#opcClients:Map<OpcServerTarget, Map<NodeId,StoreNode>> = new Map<OpcServerTarget, Map<NodeId,StoreNode>>();
}