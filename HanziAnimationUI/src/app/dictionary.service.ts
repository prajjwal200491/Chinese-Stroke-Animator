import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface DictionaryEntry {
  character: string;
  definition?: string;
  pinyin?: string[];
  decomposition?: string;
  radical?: string;
}

interface DictionaryFile {
  dictionary: DictionaryEntry[];
}

/**
 * Shared access to assets/dictionary.json plus Chinese text-to-speech.
 *
 * The file is ~4 MB and was previously re-fetched once per character by
 * DisplayCardComponent. Here it is fetched at most once for the lifetime of the
 * app and indexed into a Map, since the array holds 180k+ entries and an
 * Array.find per lookup is O(n).
 */
@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private entries$?: Observable<Map<string, DictionaryEntry>>;

  constructor(private readonly http: HttpClient) {}

  private load(): Observable<Map<string, DictionaryEntry>> {
    if (!this.entries$) {
      this.entries$ = this.http.get<DictionaryFile>('assets/dictionary.json').pipe(
        map((res) => {
          const entries = new Map<string, DictionaryEntry>();
          for (const entry of res?.dictionary ?? []) {
            if (entry?.character && !entries.has(entry.character)) {
              entries.set(entry.character, entry);
            }
          }
          return entries;
        }),
        // refCount stays false so the parsed Map survives the last unsubscribe
        // and later callers are served from cache rather than refetching.
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.entries$;
  }

  /**
   * First pinyin reading for `character`, or '' when the glyph is missing from
   * the dictionary or its `pinyin` array is empty (common for radicals).
   *
   * The previous inline `d.pinyin[0]` threw outright on an unknown glyph.
   */
  getPinyin(character: string): Observable<string> {
    return this.load().pipe(map((entries) => entries.get(character)?.pinyin?.[0] ?? ''));
  }

  /**
   * Pinyin for each character, same length and order as the input. Falls back to
   * the character itself where no reading is known, so callers never render a
   * blank gap.
   */
  getPinyinForEach(characters: string[]): Observable<string[]> {
    return this.load().pipe(
      map((entries) => characters.map((c) => entries.get(c)?.pinyin?.[0] ?? c))
    );
  }

  /**
   * Speaks `text` in Mandarin.
   *
   * Silently does nothing where no zh-CN voice is installed -- a platform
   * limitation with no reliable workaround. We deliberately do not gate the UI
   * on voice availability: getVoices() commonly returns [] on a cold load, so a
   * snapshot check would disable the control in the ordinary case.
   */
  speak(text: string): void {
    if (!text) {
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel(); // don't queue behind a previous utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }
}
