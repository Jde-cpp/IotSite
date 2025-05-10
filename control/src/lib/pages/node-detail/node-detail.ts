import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import {Component, computed, inject, Inject, model, OnDestroy, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import { IotService, SubscriptionResult } from '../../services/iot.service';
import { IErrorService, IProfile, subscribe} from 'jde-framework'
import * as types from '../../model/types';
import {  MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Error } from '../../model/Error';
import { IEnvironment } from 'jde-material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NodePageData } from '../../services/node.resolver';
import { NodeRoute } from '../../model/NodeRoute';
import { OpcNodeRouteService } from 'jde-iot';

@Component({
  selector: 'node-detail',
  templateUrl: './node-detail.html',
  styleUrls: ['./node-detail.scss'],
  standalone: true,
		imports: [RouterModule,MatButtonModule,MatCheckboxModule,MatTableModule,MatToolbarModule]
})
export class NodeDetail implements OnInit, OnDestroy {
	constructor( @Inject('IotService') private _iot:IotService, @Inject('IProfile') private profileService: IProfile, private route: ActivatedRoute, private router:Router, @Inject('IEnvironment') private environment: IEnvironment, @Inject('IErrorService') private snackbar: IErrorService )
	{}

	async ngOnInit() {
		//subscribe( this.route, "NodeDetail" );
		this.route.data.subscribe( (data)=>{
			console.log( `NodeDetail.dataChange` );
			this.pageData = data["pageData"];
			this.sideNav.set( this.pageData.route );
			console.trace( `NodeDetail.ngOnInit{ ref_count: ${this.pageData.references.length} }` );
			this.references?.filter((r)=>this.profile.subscriptions.find((s)=>s.equals(r.node))).forEach((r)=>this.selections.select(r));
			this.isLoading.set( false );
		});
		this.selections.changed.subscribe( this.onSubscriptionChange.bind(this) );
	}

  ngOnDestroy() {
		console.trace( `NodeDetail.ngOnDestroy` );
		this.selections.clear();
		this.selections.changed.unsubscribe();
		this.pageData.route.settings.save();
		this.subscription = null;
  }

	async retrieveSnapshot(){
		this.retrievingSnapshot.set( true );
		this.references.forEach( r=>r.value=null );
		var nodes = this.references.map( r=>r.node );
		var snapshots = await this._iot.snapshot( this.opcTarget, nodes );
		for( let [node,value] of snapshots ){
			var ref = this.references.find( (n)=>n.node.equals(node) );
			if( ref )
				ref.value = value;
		}
		this.retrievingSnapshot.set( false );
	}

	toObject( x:types.ENodeClass ):string{ return types.ENodeClass[x]; }
	toString( value:types.Value ){ return types.toString(value); }
  checkboxLabel(row?: types.Reference): string {
		return row
			? `${this.selections.isSelected(row) ? 'deselect' : 'select'} ${row.displayName}`
			: `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  }
	async onSubscriptionChange( r:SelectionChange<types.Reference> ){
		if( r.added.length>0 ){
			try {
				let nodes = r.added.map( r=>r.node );
				this.profile.subscriptions.push( ...nodes );
				if( !this.subscription){
					this.subscription = this._iot.subscribe( this.opcTarget, nodes, this.Key ).subscribe({
						next:(value: SubscriptionResult) =>{
							this.references.find( (r)=>r.node.equals(value.node) ).value = value.value;
						},
						error:(error: Error) =>{
							this.snackbar.error( error.message );
						},
						complete:()=>{ console.debug( "complete" );}
					});
				}
				else
					this._iot.addToSubscription( this.opcTarget, nodes, this.Key );
			} catch (e) {
				this.snackbar.error( e["error"]["message"] );
			}
		}
		if( r.removed.length>0 ){
			let nodes = r.removed.map( r=>r.node );
			this.profile.subscriptions = this.profile.subscriptions.filter( s=>!nodes.includes(s) );
			if( !this.selections.selected.length )
				this.subscription = null;
			else{
				try{
					this._iot.unsubscribe( this.opcTarget, nodes, this.Key );
				}
				catch (e) {
					this.snackbar.error( e["error"]["message"] );
				}
			}
		}
	}

  toggleAllRows() {
		if( this.isAllSelected() )
			this.selections.clear();
		else
			this.selections.select(...this.references);
  }

	async toggleValue( e:MatCheckboxChange, x:types.Reference ){
		e.source.checked = !e.source.checked;
		try {
			x.value = await this._iot.write( this.opcTarget, x.node, !x.value );
		}
		catch (e) {
			this.snackbar.show( e["message"] );
		}
	}
	async changeDouble( e:Event, x:types.Reference ){
		try {
			x.value = await this._iot.write( this.opcTarget, x.node, +e.target["value"] );
		}
		catch (e) {
			this.snackbar.show( e["message"] );
		}
	}
	async changeString( e:Event, x:types.Reference ){
		try {
			x.value = await this._iot.write( this.opcTarget, x.node, e.target["value"] );
		}
		catch (e) {
			this.snackbar.show( e["message"] );
		}
	}
	test(r:types.Reference){ debugger;}
	get columns():string[]{ return this.profile.columns; }
	ETypes = types.ETypes;
	isAllSelected = computed<boolean>( ()=>{ return this.selections.selected.length==this.references.length; } );
	isLoading = signal<boolean>( true );
	get Key():string{ return this.pageData.route.profileKey; }
	get node(){ return this.sideNav().node; };
	get ns():number{ return this.node.ns ? +this.node.ns : this.environment["defaultNS"]; }
	get opcTarget():string{ return this.sideNav().opcTarget; }
	pageData:NodePageData;
	//get parent():types.ExpandedNode{ return this.pageData.parent; }
	get profile(){ return this.pageData.route.profile; }
	get references(){ if(!this.pageData) debugger; return this.pageData?.references; }
	retrievingSnapshot = signal<boolean>( false );
	routerSubscription:Subscription;
	selections = new SelectionModel<types.Reference>(true, []);
	get showSnapshot():boolean{ return this.visibleColumns.includes("snapshot");}
	//#sideNav = signal<NodeRoute>( null );
	sideNav = model.required<NodeRoute>();
	get sort(){ return this.profile.sort; };
	get subscription(){return this.#subscription;} #subscription:Subscription;
	set subscription(x){ if(!x && this.subscription) this.subscription.unsubscribe(); this.#subscription=x; }
	viewPromise:Promise<boolean>;
	get visibleColumns(){ return this.profile.visibleColumns; }

	#routeService = inject( OpcNodeRouteService );
}