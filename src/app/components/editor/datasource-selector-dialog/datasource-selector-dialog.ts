import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {DSWTab, TabsComponent} from "../../ui/tabs/tabs.component";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";
import {NgTemplateOutlet} from "@angular/common";
import {ModalComponent} from "../../ui/modal/modal.component";

export type DataSourceType = 'kpi' | 'pivot' | 'worksheet' | 'metric';

export interface IDataSourceInfo {
  name: string;
  value: string;
  type: DataSourceType;
  date: string;
  caption: string;
  children?: IDataSourceInfo[];
}

@Component({
  selector: 'dsw-ds-sel-dialog',
  templateUrl: './datasource-selector-dialog.html',
  styleUrls: ['./datasource-selector-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TabsComponent, NgTemplateOutlet]
})
export class DataSourceSelectorDialog implements OnInit, OnDestroy {
  @Output() select = new EventEmitter<IDataSourceInfo>();
  @ViewChild('table') table!: ElementRef;
  @Input()
  _modal?: ModalComponent;

  isLoading = true;
  tabs: DSWTab[] = [
    {id: 'pivot', text: 'Pivot tables'},
    {id: 'kpi', text: 'KPI'},
    {id: 'worksheets', text: 'Worksheets'},
    {id: 'metrics', text: 'Metrics'}
  ];
  currentTab = this.tabs[0];
  data: IDataSourceInfo[] = [];
  filteredData: IDataSourceInfo[] = [];
  selected: IDataSourceInfo[] = [];
  private subSearch?: Subscription;
  private scrollTimeout?: ReturnType<typeof setTimeout>;

  constructor(private ds: DataService,
              private cd: ChangeDetectorRef) {
  }

  trackByIndex = (index: number, r: any) => index;

  ngOnInit() {
    void this.requestData();
    this.subSearch = this._modal?.search.subscribe(term => {
      this.applyFiltering(term);
    });
  }

  selectRow(d: IDataSourceInfo, idx: number) {
    if (!d.children) {
      this.select.emit(d);
      this._modal?.close();
      return;
    }
    this.selected[idx] = d;
    this.selected.splice(idx + 1, this.selected.length - idx);

    this.scrollToLast();
  }

  async requestData(tab?: DSWTab) {
    if (!tab) {
      tab = this.currentTab;
    }
    this.isLoading = true;
    this.ds.requestListOfDataSources(tab.id)
      .then(d => {
        this.retrieveData(d);
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy() {
    clearTimeout(this.scrollTimeout);
    this.subSearch?.unsubscribe();
  }

  private retrieveData(d: { children: IDataSourceInfo[] }) {
    this.data = d.children;
    this.selected = [];
    this.applyFiltering();
  }

  private scrollToLast() {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      const el = this.table.nativeElement;
      const childWidth = this.table.nativeElement.children[0].offsetWidth;
      el.scroll({
        left: this.selected.length * childWidth,
        behavior: 'smooth'
      });
    }, 10);
  }

  private applyFiltering(term = '') {
    term = term.toString();
    if (term === '') {
      this.filteredData = this.data;
      this.cd.detectChanges();
      return;
    }
    this.selected = [];
    this.filteredData = JSON.parse(JSON.stringify(this.data));
    this.filterItems(this.filteredData, term.toLowerCase());

    this.scrollToLast();
    this.cd.detectChanges();
  }

  private filterItems(children: IDataSourceInfo[], term: string): boolean {
    const toRemove: any[] = [];
    children.forEach(c => {
      if (c.children?.length) {
        if (this.filterItems(c.children, term)) {
          return;
        }
      }
      if (!c.name.toLowerCase().includes(term)) {
        toRemove.push(c);
        return;
      }
    });
    toRemove.forEach(r => {
      children.splice(children.indexOf(r), 1);
    });

    return !!children.length;
  }
}
