import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import {NgFor,NgIf,AsyncPipe} from '@angular/common';
import {Component, Inject, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import { Sort } from '@angular/material/sort';
import {RouterModule, ActivatedRoute, Router, ParamMap, NavigationEnd} from '@angular/router';
import { IotService, SubscriptionResult } from '../../services/iot.service';
import {IErrorService,IProfile,Settings} from 'jde-framework'
import * as types from '../../types/types';
import {  MatTableModule } from '@angular/material/table';
import { Observable, filter, Subscription, switchMap } from 'rxjs';
import { Error } from '../../types/Error';
import { IEnvironment } from 'jde-material';


@Component({
    selector: 'opc-server',
    templateUrl: './OpcServer.html',
    styleUrls: ['./OpcServer.scss'],
    imports: [NgFor, NgIf, AsyncPipe, MatTableModule, RouterModule, MatButtonModule, MatCheckboxModule]
})
export class OpcServer implements OnInit, OnDestroy, OnChanges {
	constructor( @Inject('IotService') private _iot:IotService, @Inject('IProfile') private profileService: IProfile, private route: ActivatedRoute, private router:Router, @Inject('IEnvironment') private environment: IEnvironment, @Inject('IErrorService') private cnsl: IErrorService ){
		this.selection.changed.subscribe( async (r:SelectionChange<types.Reference>) =>{
			if( r.added.length>0 ){
				try {
					//let nodes = this.selection.selected.map( r=>r.node );
					let nodes = r.added.map( r=>r.node );
					this.profile.value.subscriptions.push( ...nodes );
					if( !this.subscription){
						this.subscription = this._iot.subscribe( this.opc, nodes, this.Key ).subscribe({
							next:(value: SubscriptionResult) =>{
								this.references.find( (r)=>r.node.equals(value.node) ).value = value.value;
							},
							error:(error: Error) =>{
								this.cnsl.error( error.message );
							},
							complete:()=>{ console.debug( "complete" );}
						});
					}
					else
						this._iot.addToSubscription( this.opc, nodes, this.Key );
				} catch (e) {
					this.cnsl.error( e["error"]["message"] );
				}
			}
			if( r.removed.length>0 ){
				let nodes = r.removed.map( r=>r.node );
				this.profile.value.subscriptions = this.profile.value.subscriptions.filter( s=>!nodes.includes(s) );
				if( !this.selection.selected.length )
					this.subscription = null;
				else{
					try{
						this._iot.unsubscribe( this.opc, nodes, this.Key );
					}
					catch (e) {
						this.cnsl.error( e["error"]["message"] );
					}
				}
			}
		});
	}
	async ngOnInit() {
		this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
			this.profile.save();
			this.onParamChange( e.url );
		});
		this.onParamChange( this.router.url	);
	}
	ngOnChanges(){
		debugger;
	}
	async onParamChange(url:string){
		if( this.subscription )
			this.subscription = null;
		let nodeObj:types.ExpandedNodeJson={};
		if( url.indexOf("?")!=-1 ){
			const args = url.substring( url.indexOf("?")+1 ).split("&");
			for( const arg of args ){
				const separator = arg.indexOf("=");
				if( separator!=-1 )
					nodeObj[arg.substring(0,separator)] = arg.substring(separator+1);
			}
		}
		this.node = new types.ExpandedNode( nodeObj );
		this.profile = new Settings<PageSettings>( PageSettings, this.Key, this.profileService );
		await this.profile.loadedPromise;

		try{
			this.retrievingSnapshot = true;
			this.references = await this._iot.browseObjectsFolder( this.opc, this.node, true );
			this.retrievingSnapshot = false;
			if( !this.viewPromise )
				this.viewPromise = Promise.resolve( true );
		}
		catch( e ){
			this.cnsl.exception( e );
			if( e["stack"] )
				console.error( e["stack"] );
		}
	}

  ngOnDestroy() {
		this.profile.save();
		this.subscription = null;
    //if (this.routeParamSubscription) {
//      this.routeParamSubscription.unsubscribe();
  }
	toObject( x:types.ENodeClass ):string{ return types.ENodeClass[x]; }
	toString( value:types.Value ){ return types.toString(value); }

  selection = new SelectionModel<types.Reference>(true, []);
  get isAllSelected() {return this.selection.selected.length === this.references.length;}
  toggleAllRows() {
    if (this.isAllSelected)
      this.selection.clear();
		else
    	this.selection.select(...this.references);
  }
  checkboxLabel(row?: types.Reference): string {
		return row
			? `${this.selection.isSelected(row) ? 'deselect' : 'select'} ${row.displayName}`
			: `${this.isAllSelected ? 'select' : 'deselect'} all`;
  }

	get columns():string[]{ return this.settings.columns; }
	get ns():number{ return this.node.ns ? +this.node.ns : this.environment["defaultNS"]; }
	node:types.ExpandedNode;
	get opc():string{ return this.route.snapshot.paramMap.get('opc'); }
	profile:Settings<PageSettings>;
	references:types.Reference[]; 
	retrievingSnapshot:boolean=false;
	get settings(){ return this.profile.value; }
	//set showSnapshot(show:boolean){ if(show!=this.showSnapshot){ if(show)this.visibleColumns.push( "snapshot" ); else this.visibleColumns.splice( this.visibleColumns.indexOf("snapshot"), 1 );} }
	get showSnapshot():boolean{ return this.visibleColumns.includes("snapshot");}
	async retrieveSnapshot()
	{
		this.retrievingSnapshot = true;
		this.references.forEach( r=>r.value=null );
		var nodes = this.references.map( r=>r.node );
		var snapshots = await this._iot.snapshot( this.opc, nodes );
		for( let [node,value] of snapshots ){
			var ref = this.references.find( (n)=>n.node.equals(node) );
			if( ref )
				ref.value = value;
		}
		this.retrievingSnapshot = false;
	}
	async toggleValue( e:MatCheckboxChange, x:types.Reference ){
		e.source.checked = !e.source.checked;
		try {
			x.value = await this._iot.write( this.opc, x.node, !x.value );
		}
		catch (e) {
			this.cnsl.show( e["message"] );
		}
	}
	async changeDouble( e:Event, x:types.Reference ){
		try {
			x.value = await this._iot.write( this.opc, x.node, +e.target["value"] );
		}
		catch (e) {
			this.cnsl.show( e["message"] );
		}
	}
	async changeString( e:Event, x:types.Reference ){
		try {
			x.value = await this._iot.write( this.opc, x.node, e.target["value"] );
		}
		catch (e) {
			this.cnsl.show( e["message"] );
		}
	}
	valueType( x:types.Reference ){ return typeof x.dataType; }
	ETypes = types.ETypes;
	get Key():string{ return `${this.opc}.${this.node.id}x`; }
	@Input() sort:Sort = { active:"name", direction: 'asc' };
	get subscription(){return this.#subscription;} #subscription:Subscription;
	set subscription(x){if(!x && this.subscription) this.subscription.unsubscribe();	this.#subscription=x;}
	viewPromise:Promise<boolean>;
	get visibleColumns(){ return this.settings.visibleColumns; }
}

class PageSettings
{
	assign( value:PageSettings ){ this.sort = value.sort; this.columns = value.columns; this.visibleColumns=value.visibleColumns; }
	sort:Sort = {active: "name", direction: "asc"};
	visibleColumns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	columns:string[] = ['select', 'id', 'name', 'class', 'snapshot'];
	subscriptions:types.ExpandedNode[] = [];
}