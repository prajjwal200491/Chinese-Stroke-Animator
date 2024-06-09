import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { onValue, ref, set, update } from '@angular/fire/database';
import HanziWriter from 'hanzi-writer';
import { BehaviorSubject, from, Observable, of, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Character, CharacterProperties, List, ListData } from './state/app.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private writer!: HanziWriter;
  private writerHanzi= new ReplaySubject<HanziWriter>(1);
  private apiUrl = environment.apiUrl;
  private onComparison = new BehaviorSubject<any>({});
  onComparison$ = this.onComparison.asObservable();

  constructor(private readonly http: HttpClient) { }

  setComparisonValues(data:any){
    this.onComparison.next(data)
  }

  setHanziWriter(writer: HanziWriter){
    this.writerHanzi.next(writer);
  }

  getHanziWriter(): Observable<HanziWriter>{
    return this.writerHanzi.asObservable();
  }

  loadCharacter(id: string, text: string, properties: CharacterProperties): any{
    this.writer = HanziWriter.create(id, text, properties);
    return this.writer;
  }

  destroyCharacter(writer: HanziWriter){
    writer._hanziWriterRenderer?.destroy();
    this.writer=writer;
  }

  updateCharacter(character: string){
    this.writer.setCharacter(character);
  }

  startAnimation(writer: HanziWriter){
    writer.animateCharacter();
    this.writer=writer;
  }
  reverseAnimation(writer: HanziWriter){
    writer.backAnimateCharacter();
    this.writer=writer;
  }
  resumeAnimation(writer: HanziWriter){
    writer.resumeAnimation();
    this.writer=writer;
  }
  pauseAnimation(writer: HanziWriter){
    writer.pauseAnimation();
    this.writer=writer;
  }
  changeAnimationSpeed(speed: number){
    this.writer._options.strokeAnimationSpeed= speed
  }

  saveList(list:List): void{
    //  const saveRef=set(ref(this.database, 'lists/' + list.cardname), list).then(()=>{
    //   return 'successfully saved'
    // });
    // return from(saveRef);
  }

  updateList(list:List): void{
    //  const updateRef=update(ref(this.database, 'lists/' + list.cardname), list).then(()=>{
    //   return 'successfully updated'
    // });
    // return from(updateRef);
  }

  saveListData(listName: string, cardName: string, characters: any[]): Observable<any>{
    const data = {
      'listName': listName,
      'cardName': cardName,
      'characters':characters
    };
    return this.http.post(`${this.apiUrl}/api/lists/addWithCardsAndCharacters`, data);
    //  const saveRef=update(ref(this.database, 'listData/' + listData.nameWithoutSpaces), listData).then(()=>{
    //   return 'successfully saved'
    // });
    // return from(saveRef);

  }

  

  updateListData(listName: string, listId:number, cardId:number|undefined=undefined, cardName: string, characters: any[], deletedCharacters?: any[]): Observable<any>{
    const data = {
      'listName': listName,
      'listId': listId,
      'cardName': cardName,
      'cardId':cardId,
      'characters': characters,
      'deletedCharacters': deletedCharacters
    };
   return this.http.put(`${this.apiUrl}/api/lists/updateWithListCardsAndCharacters`,data);
   // return this.http.put(`http://localhost:3000/api/lists/updateWithListCardsAndCharacters`,data);
    //  const updateRef=update(ref(this.database, 'listData/' + listData.nameWithoutSpaces), listData).then(()=>{
    //   return 'successfully updated'
    // });
    // return from(updateRef);
  }

  
  // test(): Observable<any>{
  //   return this.http.put('https://fir-test-application-d5087-default-rtdb.firebaseio.com/lists.json',
  //   [{ name: 'sports', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false}]
  //   ).pipe(
  //     map(content=> Object.values(content))
  //   )
  // }
  getList(): Observable<any>{
    return this.http.get('https://fir-test-application-d5087-default-rtdb.firebaseio.com/lists.json')
    //return this.http.get('http://localhost:3000/api/lists');
  }

  getListData():Observable<any>{
    //return this.http.get('https://fir-test-application-d5087-default-rtdb.firebaseio.com/listData.json')
    //return this.http.get('http://localhost:3000/api/lists');
    return this.http.get(`${this.apiUrl}/api/lists`);
  }

  saveListChanges(listData:ListData):void{
    // const saveRef=set(ref(this.database, '/'+ 'listData'), listData).then(()=>{
    //   return 'successfully saved'
    // });
    // return from(saveRef);
 }
 


  // updateList(list:List): Observable<any>{
  //   return this.http.put('https://fir-test-application-d5087-default-rtdb.firebaseio.com/lists.json', list)
  // }

  
  
}
