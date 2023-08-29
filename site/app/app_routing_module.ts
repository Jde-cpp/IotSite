import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import { ComponentCategoryList } from 'jde-material';
import { ComponentSidenav } from 'jde-material';

import{ GraphQLComponent } from 'jde-framework';
import{ AppService, GraphQLDetailComponent } from 'jde-framework';


const routes: Routes =
[
	{
		path: 'settings',
		component: ComponentSidenav,
		data: { name: "Settings" },
		children :
		[
			{ path: '', component: ComponentCategoryList, data: { name: "Settings", summary: "Site Settings" } },
			//{ path: '', component: GraphQLDetailComponent, pathMatch: 'full', data: {} },
			//{ path: 'applications', component: Applications, data: { name: "Applications", summary: "View Applications" } },
			//{ path: 'logs', component: LogsComponent, data: { name: "Logs", summary: "View Application Logs" } },
			{ path: 'users/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}] },
			{ path: 'users', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Users", summary: "View/Modify Users" } },
			{ path: 'roles/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}] },
			{ path: 'roles', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Roles", summary: "View/Modify Roles" } },
			{ path: 'groups/:id', component: GraphQLDetailComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}] },
			{ path: 'groups', component: GraphQLComponent, providers: [ {provide: 'IGraphQL', useClass: AppService}], data: { name: "Groups", summary: "View/Modify Groups" } },
			//{ path: '', component: ComponentCategoryList, data: { name: "Settings", summary: "Site Settings" } }
		]
	}
];

@NgModule( { imports: [RouterModule.forRoot(routes)], exports: [RouterModule]} )
 export class AppRoutingModule {
 }