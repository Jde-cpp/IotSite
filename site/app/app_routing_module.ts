import { NgModule } from '@angular/core';
import {Routes, ROUTES, RouterModule} from '@angular/router';
import { ComponentSidenav } from 'jde-material';

import{ Applications, DetailResolver, Cards, LoginPageComponent, QLList, QLListResolver, QLListRouteService, HomeRouteService } from 'jde-framework';
import{ OpcRouteService, OpcNodeRouteService, OpcServer, NodeResolver, IotService, GatewayDetail, NodeDetail } from 'jde-iot';
import { AccessService, AuthGuard, Group, GroupDetail, Role, RoleDetail, User, UserDetail } from 'jde-access';


const accessProvider = { provide: 'IGraphQL', useClass: AccessService };
const iotProvider = { provide: 'IGraphQL', useClass: IotService };
const qlListProvider = { provide: 'IRouteService', useClass: QLListRouteService };
const opcNodeRouteProvider = { provide: 'IRouteService', useClass: OpcNodeRouteService };;

export const routes: Routes = [
	{ path: '', title: "Home", component: Cards, data: {summary: "Welcome" },
		canActivate: [AuthGuard],
		providers: [  {provide: 'IRouteService', useClass: HomeRouteService} ]},
	{ path: 'login', component: LoginPageComponent, data: {name: "Login", summary: "Login to Site"} },

	{ path: 'opcServers', title: "OPC Servers", canActivate: [AuthGuard], component: Cards,
		providers: [{provide: 'IRouteService', useClass: OpcRouteService}], data: {
		summary: "Available OPC Servers",
	} },
	{ path: 'opcServers',
		component: ComponentSidenav,
		children :[
			{ path: ':target',     component: NodeDetail, canActivate: [AuthGuard], resolve: { pageData: NodeResolver }, providers: [NodeResolver,opcNodeRouteProvider], runGuardsAndResolvers: "pathParamsOrQueryParamsChange" }/*,
			{ path: ':target/:id', component: NodeDetail, canActivate: [AuthGuard], resolve: { pageData: NodeResolver }, providers: [NodeResolver,opcNodeRouteProvider], runGuardsAndResolvers: "paramsChange" },*/
		]
	},

	{ path: 'access', title: "Access", component: Cards, providers: [qlListProvider], canActivate: [AuthGuard], data: {
		summary: "Configure User Access"
	} },
	{ path: 'access', component: ComponentSidenav, canActivate: [AuthGuard], providers:[qlListProvider],
			children :[
				{ path: 'users/:target',
					component: UserDetail,
					providers: [ DetailResolver<User>, accessProvider ],
					resolve: { pageData: DetailResolver<User> },
					canActivate: [AuthGuard],
					runGuardsAndResolvers: "paramsChange"
				},
				{ path: 'groups/:target',
					component: GroupDetail,
					providers: [ DetailResolver<Group>, accessProvider ],
					resolve: { pageData: DetailResolver<Group> },
					canActivate: [AuthGuard],
					runGuardsAndResolvers: "paramsChange"
				},
				{ path: 'roles/:target',
					component: RoleDetail,
					providers: [ DetailResolver<Role>, accessProvider ],
					data: { summary: "Role Detail" },
					resolve: { pageData: DetailResolver<Role> },
					canActivate: [AuthGuard],
					runGuardsAndResolvers: "paramsChange"
				},
				{ path: ':collectionDisplay',
					component: QLList,
					runGuardsAndResolvers: "paramsChange",
					providers: [ QLListResolver, accessProvider ],
					resolve: { data: QLListResolver },
					canActivate: [AuthGuard],
					data: { collections: [
						{ path:"users", data:{showAdd:false} },
						{ path:"groups", data:{collectionName: "groupings"} },
						"roles",
						{ path:"resources", data:{canPurge:false} }
					]}
				},
			]
	},
	{ path: 'settings', title: "Settings", canActivate: [AuthGuard], component: Cards, providers: [qlListProvider] },
	{ path: 'settings', component: ComponentSidenav, providers: [qlListProvider],
		children:
		[
//			{ path: 'applications', component: Applications, title: "Applications", canActivate: [AuthGuard], data: { summary: "View Applications" } },
			{
				path: ':collectionDisplay',
				component: QLList,
				providers:[ QLListResolver, iotProvider],
				resolve: {data : QLListResolver},
				canActivate: [AuthGuard],
				data: { collections: [
					{ path:"opcClients", title: "OPC Clients", data:{summary: "Change OPC Clients on Gateway", collectionName: "clients"} },
				]}
			},
			{
				path: 'opcClients/:target',
				component: GatewayDetail,
				providers: [ DetailResolver<OpcServer>, iotProvider ],
				canActivate: [AuthGuard],
				data: { summary: "Opc Gateway Detail" },
				resolve: { pageData: DetailResolver<OpcServer> }
			}
		]
	}
];
function setRoutes(){
	return routes;
}

@NgModule( { imports: [RouterModule.forRoot([])], exports: [RouterModule],
	providers: [
		{ provide: ROUTES, useFactory: setRoutes, multi: true },AuthGuard]
})
export class AppRoutingModule
{}