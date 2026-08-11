import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { OcrService } from 'src/app/ocr.service';

// jQuery slim + Bootstrap 4 JS are globals loaded from the CDN in index.html.
declare var $: any;

interface WordChip {
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-word-import',
  templateUrl: './word-import.component.html',
  styleUrls: ['./word-import.component.scss'],
})
export class WordImportComponent implements OnDestroy {
  // Angular sanitizes blob: URLs in [src] to "unsafe:blob:..." — the object
  // URL is one we created ourselves, so bypassing is safe. Keep the raw
  // string separately for revokeObjectURL.
  previewUrl: SafeUrl | null = null;
  private rawPreviewUrl: string | null = null;
  selectedFile: File | null = null;
  chips: WordChip[] = [];
  wordsToSeed: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly ocrService: OcrService,
    private readonly sanitizer: DomSanitizer
  ) {}

  get selectedCount(): number {
    return this.chips.filter((c) => c.selected).length;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.selectedFile = file;
    if (this.rawPreviewUrl) {
      URL.revokeObjectURL(this.rawPreviewUrl);
    }
    this.rawPreviewUrl = URL.createObjectURL(file);
    this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(this.rawPreviewUrl);
    this.chips = [];
    this.errorMessage = '';
    // Reset so picking the same file again still fires (change).
    input.value = '';
    $('#wordImportModal').modal('show');
  }

  runOcr() {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.ocrService.recognize(this.selectedFile).subscribe(
      (res) => {
        this.isLoading = false;
        this.chips = this.segmentChinese(res?.text || '').map((value) => ({
          value,
          selected: true,
        }));
        if (this.chips.length === 0) {
          this.errorMessage = 'No Chinese words found in the photo.';
        }
      },
      (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.detail || 'Could not read the photo. Please try again.';
      }
    );
  }

  private segmentChinese(text: string): string[] {
    const cjk = /[㐀-䶿一-鿿]/;
    let chunks: string[];
    // Intl.Segmenter is missing from Angular 13's TS lib typings and from
    // older browsers; fall back to per-character chips.
    const Segmenter = (Intl as any).Segmenter;
    if (typeof Segmenter === 'function') {
      const segmenter = new Segmenter('zh', { granularity: 'word' });
      chunks = Array.from(segmenter.segment(text), (s: any) => s.segment);
    } else {
      chunks = Array.from(text);
    }
    const seen = new Set<string>();
    return chunks
      .map((c) => c.trim())
      .filter((c) => cjk.test(c)) // drop punctuation/whitespace/latin
      .filter((c) => (seen.has(c) ? false : !!seen.add(c))); // dedupe
  }

  toggleChip(chip: WordChip) {
    chip.selected = !chip.selected;
  }

  addSelectedWords() {
    // New array reference so app-modal's ngOnChanges fires.
    this.wordsToSeed = this.chips.filter((c) => c.selected).map((c) => c.value);
    // Chain the modals: wait for the hide animation to finish before opening
    // the Create modal, otherwise the backdrops fight each other.
    $('#wordImportModal').one('hidden.bs.modal', () =>
      $('#importListModal').modal('show')
    );
    $('#wordImportModal').modal('hide');
  }

  ngOnDestroy() {
    if (this.rawPreviewUrl) {
      URL.revokeObjectURL(this.rawPreviewUrl);
    }
  }
}
