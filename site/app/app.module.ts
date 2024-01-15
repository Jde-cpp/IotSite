import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {COMMA, SPACE} from '@angular/cdk/keycodes';
import {MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
 import {MatSelectModule} from '@angular/material/select';
import {NavBar, EnvironmentService} from 'jde-material';

 import {AuthService,AppService} from 'jde-framework';
 import {IotService} from 'jde-iot';
import {LocalStorageProfile} from 'jde-framework'
import {DefaultErrorService } from 'jde-framework'

import {CanActivateComponentSidenav} from 'jde-material';
import {ThemeStorage} from 'jde-material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app_routing_module';

@NgModule({
	declarations: [
		AppComponent
	],
  	imports: [
		RouterModule, HttpClientModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
		MatDialogModule, MatSnackBarModule, MatAutocompleteModule, MatSelectModule,// MatInputModule,//MatFormFieldModule,
		AppRoutingModule,NavBar
  ],
  providers: [
		{provide: MAT_CHIPS_DEFAULT_OPTIONS,useValue: {separatorKeyCodes: [COMMA, SPACE]} },
		{provide: 'IProfile', useClass: LocalStorageProfile},
		{provide: 'IErrorService', useClass: DefaultErrorService},
		{provide: 'IAuth', useClass: AuthService},
		{provide: 'IEnvironment', useClass: EnvironmentService},
		{provide: 'IGraphQL', useClass: IotService},
		{provide: 'AppService', useClass: AppService},
		{provide: 'IotService', useClass: IotService},
	],
	bootstrap: [AppComponent]
})
export class AppModule { }