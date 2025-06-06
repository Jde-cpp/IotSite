import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { AppService, AuthStore, DefaultErrorService,LocalStorageProfile } from 'jde-framework'
import {IotService, IotAuthService, OpcNodeRouteService, OpcStore} from 'jde-iot';
import {EnvironmentService} from './services/environment.service';
import { routes } from './app_routing_module';
import { AuthGuard, AccessService } from "jde-access";

export const appConfig: ApplicationConfig = {
  providers: [provideAnimationsAsync(),
		provideHttpClient(),
		provideRouter(routes),
		{provide: "AccessService", useClass: AccessService},
		{provide: 'AppService', useClass: AppService},
		{provide: 'IAuth', useClass: IotAuthService},
		{provide: "AuthGuard", useClass: AuthGuard},
		{provide: "AuthStore", useClass: AuthStore},
		{provide: 'IEnvironment', useClass: EnvironmentService},
		{provide: 'IErrorService', useClass: DefaultErrorService},
		{provide: 'IotService', useClass: IotService},
		{provide: 'OpcStore', useClass: OpcStore},
		{provide: 'IProfile', useClass: LocalStorageProfile},
		{provide: "OpcNodeRouteService", useClass: OpcNodeRouteService},
	]
};