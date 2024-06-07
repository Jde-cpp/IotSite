import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { AppService, DefaultErrorService,LocalStorageProfile } from 'jde-framework'
import {IotService, IotAuthService} from 'jde-iot';
import {EnvironmentService} from './services/environment.service';
import { routes } from './app_routing_module';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimationsAsync(),		
		provideHttpClient(),
		provideRouter(routes),
		{provide: 'IEnvironment', useClass: EnvironmentService},
		{provide: 'IErrorService', useClass: DefaultErrorService},
		{provide: 'IGraphQL', useClass: IotService},
		{provide: 'IProfile', useClass: LocalStorageProfile},
		{provide: 'IAuth', useClass: IotAuthService},
		{provide: 'AppService', useClass: AppService},
		{provide: 'IotService', useClass: IotService},
	]
};
