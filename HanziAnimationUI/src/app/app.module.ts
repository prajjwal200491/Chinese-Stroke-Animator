import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { HeaderComponent } from './shared/components/header/header.component';
import { MainPageComponent } from './main-page/main-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CharacterStrokesComponent } from './character-strokes/character-strokes.component';
import { appReducer } from './state/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { CustomBackgroundComponent } from './custom-background/custom-background.component';
import { CharacterDecompositionComponent } from './character-decomposition/character-decomposition.component';
import { HttpClientModule } from '@angular/common/http';
import { AppEffects } from './state/app.effects';
import { CharacterComponent } from './shared/components/character/character.component';
import { CharacterListComponent } from './character-list/character-list.component';
import { CustomListComponent } from './shared/components/custom-list/custom-list.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ContentListViewComponent } from './shared/content-list-view/content-list-view.component';
import { GroupCharactersComponent } from './shared/components/group-characters/group-characters.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { ListComponent } from './list/list.component';
import { ListWrapprComponent } from './list-wrappr/list-wrappr.component';
import { AddCardModalComponent } from './add-card-modal/add-card-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainPageComponent,
    CharacterComponent,
    CharacterStrokesComponent,
    CustomBackgroundComponent,
    CharacterDecompositionComponent,
    CharacterListComponent,
    CustomListComponent,
    ModalComponent,
    ContentListViewComponent,
    GroupCharactersComponent,
    ListComponent,
    ListWrapprComponent,
    AddCardModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot({character:appReducer}, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    EffectsModule.forRoot([AppEffects]),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
