import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Database, onValue, ref, set, update } from '@angular/fire/database';
import HanziWriter from 'hanzi-writer';
import { from, Observable, of, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Character, CharacterProperties, List } from './state/app.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private writer!: HanziWriter;
  private writerHanzi= new ReplaySubject<HanziWriter>(1)

  constructor(private readonly http: HttpClient, private readonly database: Database) { }

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

  saveList(list:List): Observable<string>{
     const saveRef=set(ref(this.database, 'lists/' + list.name), list).then(()=>{
      return 'successfully saved'
    });
    return from(saveRef);
  }

  updateList(list:List): Observable<string>{
     const updateRef=update(ref(this.database, 'lists/' + list.name), list).then(()=>{
      return 'successfully updated'
    });
    return from(updateRef);
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
  }



  // updateList(list:List): Observable<any>{
  //   return this.http.put('https://fir-test-application-d5087-default-rtdb.firebaseio.com/lists.json', list)
  // }

  
  
}
