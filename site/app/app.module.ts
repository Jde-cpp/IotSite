import { DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {Routes, RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
// import {MatButtonModule} from '@angular/material/button';
// import {MatCardModule} from '@angular/material/card';
// import {MatCheckboxModule} from '@angular/material/checkbox';
// import {MatChipsModule} from '@angular/material/chips';
// import {MatNativeDateModule} from '@angular/material/core';
// import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// import { MatMenuModule } from '@angular/material/menu';
// import {MatRadioModule} from '@angular/material/radio';
// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatPaginatorModule} from '@angular/material/paginator';
 import {MatSelectModule} from '@angular/material/select';
// import {MatSortModule} from '@angular/material/sort';
// import {MatTabsModule} from '@angular/material/tabs';
// import {MatTableModule} from '@angular/material/table';
// import {MatToolbarModule} from '@angular/material/toolbar';

// import {SeverityPickerComponent} from 'jde-framework'
import {NavBarModule, EnvironmentService} from 'jde-material';

// import {ThemePickerModule} from 'jde-material-site';
//import {StyleManager} from 'jde-material';

 import {AuthService,IGraphQL} from 'jde-framework';
 import {IotService} from 'jde-iot';


// import{ UserComponent } from './pages/user-management/users/users';
// import{ GraphQLComponent } from './pages/GraphQL/graph-ql-component';
// import{ LogsComponent } from './pages/logs/logs';
// import{ GraphQLDetailComponent } from './pages/GraphQL/detail/graph-ql-detail';
// import{ GraphQLProperties } from './pages/GraphQL/properties/properties';
// import{ GraphQLLinkComponent } from  './pages/GraphQL/links/links';
// import{ GraphQLTable } from  './pages/GraphQL/table/table';

// import{ UserEntryDialog } from './pages/user-management/users/dialog/user-dialog';
// import{ CandlestickComponent } from 'jde-tws';
// import {SelectDialog} from './pages/GraphQL/select-dialog/select-dialog';
// import {InvestorsComponent} from './pages/Edgar/investors';
// import {DateRangeComponent} from 'jde-framework'
// import {LinkSelectComponent} from 'jde-framework'
// import {PaginatorComponent} from 'jde-framework';



// import {OrderComponent} from 'jde-tws'
// import {PortfolioComponent} from 'jde-tws';
// import {SnapshotComponent, SnapshotContentComponent, FundamentalsComponent, NewsComponent, SummaryComponent, WatchComponent, WatchContentComponent, WatchTableComponent } from 'jde-tws';
// import {TradeComponent} from 'jde-tws'


// import {BlocklyViewerComponent} from 'jde-blockly';
// import {BlocklyCategoryList} from 'jde-blockly';
// import {BlocklySidenav} from 'jde-blockly'
import {LocalStorageProfile} from 'jde-framework'
import {DefaultErrorService } from 'jde-framework'

import {CanActivateComponentSidenav} from 'jde-material';
import {ThemeStorage} from 'jde-material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app_routing_module';
// import { ComponentCategoryList } from 'jde-material-site';
// import { ComponentSidenav } from 'projects/jde-material-site/src/lib/pages/component-sidenav/component-sidenav';

@NgModule({
	declarations: [
		AppComponent
		// ComponentCategoryList,
		// BlocklyCategoryList,BlocklyViewerComponent,PortfolioComponent,OrderComponent, SnapshotComponent, SnapshotContentComponent, FundamentalsComponent, NewsComponent, SummaryComponent, TradeComponent, WatchComponent, WatchContentComponent, WatchTableComponent,
		// PaginatorComponent,
		// CandlestickComponent,
		// InvestorsComponent,
		// SeverityPickerComponent,
		// UserComponent, UserEntryDialog, SelectDialog, LogsComponent, GraphQLComponent, GraphQLDetailComponent, GraphQLProperties, GraphQLTable, GraphQLLinkComponent, LinkSelectComponent, DateRangeComponent,
	],
  	imports: [
		BrowserModule, HttpClientModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
		MatDialogModule, MatSnackBarModule, MatAutocompleteModule, MatSelectModule,// MatInputModule,//MatFormFieldModule,
	//  , MatButtonModule, MatDialogModule, , MatMenuModule, MatIconModule, MatNativeDateModule, MatExpansionModule, MatRadioModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatToolbarModule, MatPaginatorModule, MatDatepickerModule, MatSelectModule, MatSortModule, MatTableModule, MatTabsModule,

		AppRoutingModule,NavBarModule//, ThemePickerModule
  ],
  /*entryComponents: [TransactDialog, RollDialog, OptionEntryDialog, UserEntryDialog, SelectDialog],*/
  providers: [
		{provide: 'IProfile', useClass: LocalStorageProfile},
		{provide: 'IErrorService', useClass: DefaultErrorService},
		{provide: 'IAuth', useClass: AuthService},
		{provide: 'IEnvironment', useClass: EnvironmentService},
		{provide: 'IGraphQL', useClass: IotService},
		//CanActivateComponentSidenav, StyleManager, ThemeStorage, DecimalPipe
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
