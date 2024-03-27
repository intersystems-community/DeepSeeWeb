import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {fromEvent} from 'rxjs/internal/observable/fromEvent';
import {debounceTime} from 'rxjs/internal/operators/debounceTime';
import {Subscription} from 'rxjs/internal/Subscription';
import {RouterLink} from '@angular/router';


const BTN_MORE_WIDTH = 37;

export class DSWTab {
  id = '';
  text = '';
  hidden? = false;
}

@Component({
  selector: 'dsw-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink]
})
export class TabsComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChildren('elements') elements!: QueryList<ElementRef>;
  @Input() tabs: DSWTab[] = [];
  @Input() currentTab?: DSWTab;
  @Input() useQuery = false;
  @Output() currentTabChange = new EventEmitter<DSWTab>();

  isMoreButtonVisible = false;
  isOpened = false;

  private subResize?: Subscription;
  private subClick?: Subscription;

  constructor(private el: ElementRef,
              private cd: ChangeDetectorRef,
              private zone: NgZone
  ) {
    this.zone.runOutsideAngular(() => {
      this.subClick = fromEvent(window, 'click')
        .subscribe(e => {
          let p = e.target as HTMLElement;
          while (p) {
            if (p.classList.contains('btn-more')) {
              return;
            }
            if (!p.parentElement) {
              break;
            }
            p = p.parentElement;
          }
          this.isOpened = false;
        });
      this.subResize = fromEvent(window, 'resize')
        .pipe(debounceTime(50))
        .subscribe((event) => {
          this.recalcTabsVisibility(true);
        });
    });
  }

  get hiddenTabs() {
    return this.tabs.filter(t => t.hidden);
  }

  trackByIdentity = (index: number, t: DSWTab) => t.id;

  tabClick(tab: DSWTab) {
    this.currentTab = tab;
    this.currentTabChange.emit(this.currentTab);
  }

  /**
   * Scroll body to top of the tabs line
   */
  scrollToTabs() {
    this.el.nativeElement.scrollIntoView();
  }

  ngAfterViewInit() {
    this.recalcTabsVisibility();
  }

  ngOnChanges(changes: SimpleChanges) {
    const t = changes['tabs'];
    if (t.previousValue !== t.currentValue || t.previousValue?.length !== t.currentValue?.length) {
      if (this.isArraysEqual(t.previousValue, t.currentValue)) {
        return;
      }
      setTimeout(() => {
        this.recalcTabsVisibility();
      });
    }
  }

  recalcTabsVisibility(detectChanges = false) {
    if (!this.elements) {
      return;
    }
    const w = this.el.nativeElement.offsetWidth;
    const tabs = this.elements.toArray().map(e => e.nativeElement);
    let x = 0;
    this.isMoreButtonVisible = false;
    tabs.forEach((t, idx) => {
      const last = idx === tabs.length - 1;
      const b = t.getBoundingClientRect();
      x += b.width;
      if (x > w + 8 - (last ? 0 : BTN_MORE_WIDTH)) {
        this.tabs[idx].hidden = true;
        this.isMoreButtonVisible = true;
      } else {
        this.tabs[idx].hidden = false;
      }
    });
    if (detectChanges) {
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.subClick) {
      this.subClick.unsubscribe();
    }
    if (this.subResize) {
      this.subResize.unsubscribe();
    }
  }

  onOpenTabsClick(e: MouseEvent) {
    this.isOpened = !this.isOpened;
  }

  private isArraysEqual(a1: any[], a2: any[]): boolean {
    if (!a1 || !a2) {
      return false;
    }
    if (a1.length !== a2.length) {
      return false;
    }
    for (let i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }
}
