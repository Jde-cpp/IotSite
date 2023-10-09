import {NgFor,NgIf,AsyncPipe} from '@angular/common';
import {Component, Inject, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { Sort } from '@angular/material/sort';
import {RouterModule, ActivatedRoute, Router, ParamMap, NavigationEnd} from '@angular/router';
import { IotService } from '../../services/iot.service';
import * as types from '../../types/types';
import {  MatTableModule } from '@angular/material/table';
import { environment } from '../../../../environments/environment';
import { Observable, filter, firstValueFrom, switchMap } from 'rxjs';


@Component({
  selector: 'opc-server',
  templateUrl: './OpcServer.html',
  styleUrls: ['./OpcServer.scss'],
  standalone: true,
		imports: [NgFor,NgIf,AsyncPipe, MatTableModule, RouterModule,MatButtonModule]
})
export class OpcServer implements OnInit, OnDestroy, OnChanges {
	constructor( @Inject('IotService') private _iot:IotService, private route: ActivatedRoute, private router:Router ){}
	async ngOnInit() {
		this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
			this.onParamChange( e.url );
		});
		this.onParamChange( this.router.url	);
	}
	ngOnChanges(){
		debugger;
	}
	async onParamChange(url:string){
		let nodeObj:types.ExtendedNodeJson={};
		if( url.indexOf("?")!=-1 ){
			const args = url.substring( url.indexOf("?")+1 ).split("&");
			for( const arg of args ){
				const separator = arg.indexOf("=");
				if( separator!=-1 )
				nodeObj[arg.substring(0,separator)] = arg.substring(separator+1);
			}
		}
		this.node = new types.ExtendedNode( nodeObj );

		this.references = await this._iot.browseObjectsFolder( this.opc, this.node );
		if( !this.viewPromise )
			this.viewPromise = Promise.resolve( true );
	}

  ngOnDestroy() {
    //if (this.routeParamSubscription) {
//      this.routeParamSubscription.unsubscribe();
  }
	toObject( x:types.ENodeClass ):string{ return types.ENodeClass[x]; }

	get ns():number{ return +this.route.snapshot.paramMap.get('ns') ?? environment.defaultNS; }
	node:types.ExtendedNode;
	get opc():string{ return this.route.snapshot.paramMap.get('opc'); }
	references:types.Reference[];
	@Input() sort:Sort = { active:"name", direction: 'asc' };
	viewPromise:Promise<boolean>;
}
