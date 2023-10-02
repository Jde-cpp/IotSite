import {NgFor,NgIf,AsyncPipe} from '@angular/common';
import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { IotService } from '../../services/iot.service';
import * as types from '../../types/types';
import {  MatTableModule } from '@angular/material/table';


@Component({
  selector: 'opc-server',
  templateUrl: './OpcServer.html',
  //styleUrls: ['./component-category-list.scss'],
  standalone: true,
		imports: [NgFor,NgIf,AsyncPipe, MatTableModule]
})
export class OpcServer implements OnInit, OnDestroy {
	constructor( @Inject('IotService') private _iot:IotService ){}
	async ngOnInit() {
		let result:{references:types.IReference[]} = await this._iot.browseObjectsFolder();
		this.references = result.references;
		//this.references = [{displayName:{text:"Test"}},{displayName:{text:"Test2"}},{displayName:{text:"Test3"}}];
		this.viewPromise = Promise.resolve(true);
		debugger;
	}
  ngOnDestroy() {
    //if (this.routeParamSubscription) {
//      this.routeParamSubscription.unsubscribe();
  }
	toObject( x:types.ENodeClass ):string{ return types.ENodeClass[x]; }

	viewPromise:Promise<boolean>;
	references:types.IReference[];
	@Input() sort:Sort = { active:"name", direction: 'asc' };
}
