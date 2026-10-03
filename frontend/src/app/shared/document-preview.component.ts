import { Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';

/** Previews an uploaded document (image or PDF data URL) and offers a download with the right extension. */
@Component({
  selector: 'app-document-preview',
  template: `
    @if (isPdf()) {
      <iframe [src]="safeUrl()" title="Document preview" class="w-100 border rounded mb-2" style="height: 400px;"></iframe>
    } @else {
      <img [src]="file()" alt="Uploaded document" class="img-thumbnail mb-2 d-block" style="max-width: 100%; max-height: 360px;" />
    }
    <a [href]="safeUrl()" [attr.download]="fileName() + '.' + extension()" class="btn btn-outline-primary btn-sm">
      <i class="bi bi-download me-1"></i>Download
    </a>
  `,
})
export class DocumentPreviewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly file = input.required<string>();
  readonly fileName = input('document');

  private readonly mime = computed(() => /^data:([^;]+);/.exec(this.file())?.[1] ?? 'application/octet-stream');
  protected readonly isPdf = computed(() => this.mime() === 'application/pdf');
  protected readonly extension = computed(() => {
    const sub = this.mime().split('/')[1] ?? 'bin';
    return sub === 'jpeg' ? 'jpg' : sub;
  });
  // The backend only accepts image/* and application/pdf data URLs, so trusting this value is safe.
  protected readonly safeUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.file()));
}
