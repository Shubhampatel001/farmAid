import { Component, computed, input, linkedSignal, output, Signal } from '@angular/core';

export interface Pager<T> {
  page: ReturnType<typeof linkedSignal<T[], number>>;
  totalPages: Signal<number>;
  items: Signal<T[]>;
  offset: Signal<number>;
  pageSize: number;
}

/** Client-side pagination over a signal; resets to page 1 whenever the source list changes. */
export function createPager<T>(source: Signal<T[]>, pageSize = 5): Pager<T> {
  const page = linkedSignal<T[], number>({ source, computation: () => 1 });
  const totalPages = computed(() => Math.max(1, Math.ceil(source().length / pageSize)));
  const offset = computed(() => (page() - 1) * pageSize);
  const items = computed(() => source().slice(offset(), offset() + pageSize));
  return { page, totalPages, items, offset, pageSize };
}

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination-controls d-flex justify-content-center align-items-center gap-2 mt-3" aria-label="Pagination">
        <button type="button" class="btn btn-outline-secondary" [disabled]="page() === 1" (click)="pageChange.emit(page() - 1)">
          Previous
        </button>
        <span class="page-info">Page {{ page() }} of {{ totalPages() }}</span>
        <button type="button" class="btn btn-outline-secondary" [disabled]="page() === totalPages()" (click)="pageChange.emit(page() + 1)">
          Next
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
}
