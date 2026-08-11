import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  recognize(file: File): Observable<{ text: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    // No manual Content-Type header -- the browser sets the multipart boundary.
    return this.http.post<{ text: string }>(`${this.apiUrl}/api/ocr`, formData);
  }
}
