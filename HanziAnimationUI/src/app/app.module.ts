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
    ContentListViewComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
