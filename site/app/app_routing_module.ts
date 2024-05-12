import { NgModule } from '@angular/core';
import {Routes, ROUTES, RouterModule} from '@angular/router';

import { ComponentCategoryList } from 'jde-material';
import { ComponentSidenav } from 'jde-material';

import{ GraphQLComponent } from 'jde-framework';
import{ Applications, AppService, GraphQLDetailComponent } from 'jde-framework';
import{ IotService, OpcRouteService, OpcServer } from 'jde-iot';

export const routes: Routes =
[
	{
		path: 'opcServers',
		component: ComponentSidenav,
		data: { name: "OPC Servers" },
		children :
		[
			{ path: '', component: ComponentCategoryList, data: { name: "OPC Servers", summary: "OPC Servers" }, providers: [ {provide: 'IRouteService', useClass: OpcRouteService}] },
			{ path: ':opc', component: OpcServer },
			{ path: ':opc/:id/:ns', component: OpcServer },
		]
	},
	{
		path: 'settings',
		component: ComponentSidenav,
		data: { name: "Settings" },
		children :
		[
			{ path: '', component: ComponentCategoryList, data: { name: "Settings", summary: "Site Settings" } },
			//{ path: '', component: GraphQLDetailComponent, pathMatch: 'full', data: {} },
			{ path: 'applications', component: Applications, data: { name: "Applications", summary: "View Applications" } },
			//{ path: 'logs', component: LogsComponent, data: { name: "Logs", summary: "View Application Logs" } },
			{ path: 'users/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { excludedColumns:["isGroup","password"] } },
			{ path: 'users', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Users", summary: "View/Modify Users", excludedColumns:["isGroup","password"] } },
			{ path: 'roles/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}] },
			{ path: 'roles', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Roles", summary: "View/Modify Roles" } },
			{ path: 'groups/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}] },
			{ path: 'groups', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Groups", summary: "View/Modify Groups" } },
			{ path: 'opcServers', component: GraphQLComponent, data: { name: "OpcServers", summary: "View/Modify OPC Servers" } },
			{ path: 'opcServers/:id', component: GraphQLDetailComponent },
			//{ path: '', component: ComponentCategoryList, data: { name: "Settings", summary: "Site Settings" } }
		]
	}
];
function setRoutes( iot:IotService ){
	return routes;
}

@NgModule( { imports: [RouterModule.forRoot([])], exports: [RouterModule],
	providers: [{
      provide: ROUTES,
      useFactory: setRoutes,
			multi: true
	}]})
 export class AppRoutingModule {
 }

