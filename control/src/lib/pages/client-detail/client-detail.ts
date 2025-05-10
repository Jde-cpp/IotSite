import { Component, effect, OnInit, OnDestroy, Inject, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ComponentPageTitle } from 'jde-material';
import { DetailResolverData, IErrorService, IGraphQL, IProfile, Properties} from 'jde-framework';

import { OpcServer } from '../../model/OpcServer';
import { IotService } from '../../services/iot.service';

@Component( {
	selector: 'roles',
	templateUrl: './client-detail.html',
	styleUrls: ['./client-detail.scss'],
	host: {class:'main-content mat-drawer-container my-content'},
	imports: [CommonModule, MatButtonModule, MatIcon, MatTabsModule, Properties]
})
export class GatewayDetail implements OnDestroy, OnInit{
	constructor( private route: ActivatedRoute, private router:Router, private componentPageTitle:ComponentPageTitle, @Inject('IProfile') private profileService: IProfile, @Inject('IErrorService') private snackbar: IErrorService ){
		effect(() => {
			if( !this.properties() )
				return;
			if( !this.properties().canSave )
				this.isChanged.set( false );
			else if( !this.properties().equals(this.gateway.properties) )
				this.isChanged.set( true );
		});
		route.data.subscribe( (data)=>{
			this.pageData = data["pageData"];
			this.gateway = new OpcServer( this.pageData.row );
			this.pageData.row = null;

			this.properties.set( this.gateway.properties );
		});
	}
	ngOnDestroy(){
		this.profile.save();
	}
	async ngOnInit(){
		this.sideNav.set( this.pageData.routing );
	}
	tabIndexChanged( index:number ){ this.profile.value.tabIndex = index;}

	async onSubmitClick(){
		try{
			const upsert = new OpcServer( {
				id:this.properties().id,
				...this.properties(),
			});
			const mutation = upsert.mutation( this.gateway );
			await this.ql.mutation( mutation );
			this.router.navigate( ['..'], { relativeTo: this.route } );
		}catch(e){
			this.snackbar.error( "Save failed.", e );
		}
	}
	public onCancelClick(){
		this.router.navigate( ['..'], { relativeTo: this.route } );
	}

	gateway:OpcServer;
	pageData:DetailResolverData<OpcServer>;
	ctor:new (item: any) => any = OpcServer;
	isChanged = signal<boolean>( false );
	get profile(){ return this.pageData.pageSettings.profile;}

	properties = signal<OpcServer>( null );
	get schema(){ return this.pageData.schema; }
	sideNav = signal<any>( null );
	ql:IGraphQL = inject( IotService );
}