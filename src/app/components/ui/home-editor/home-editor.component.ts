import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {dsw} from '../../../../environments/dsw';
import {MenuService} from '../../../services/menu.service';
import {SidebarService} from '../../../services/sidebar.service';
import {DataService, ITileInfo} from '../../../services/data.service';
import {StorageService} from '../../../services/storage.service';
import {NavigationStart, Router} from '@angular/router';
import {I18nPipe} from '../../../services/i18n.service';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {InputComponent} from '../input/input/input.component';
import {SidebarActionsComponent} from '../sidebar-actions/sidebar-actions.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {NgClass} from '@angular/common';

interface IWidgetList {
  idx: number;
  name: string;
}

interface IHomeEditorModel {
  colors: string[];
  fontColors: string[];
  icons: string[];
  widgetList: IWidgetList[];
}

@Component({
  selector: 'dsw-home-editor',
  templateUrl: './home-editor.component.html',
  styleUrls: ['./../../editor/editor-styles.scss', './home-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SidebarActionsComponent, InputComponent, FormsModule, NgSelectModule, I18nPipe, NgClass]
})
export class HomeEditorComponent implements OnInit, OnDestroy {
  @Input() tiles: ITileInfo[] = [];
  @Input() folder = '';
  model: IHomeEditorModel = {
    colors: dsw.const.bgColorClasses,
    fontColors: dsw.const.fontColors,
    icons: dsw.const.icons,
    widgetList: []
  };
  private originalTiles = '';
  private subRouteChange = this.router.events.pipe(takeUntilDestroyed());

  constructor(private ds: DataService,
              private ms: MenuService,
              private sbs: SidebarService,
              private st: StorageService,
              private router: Router,
              private cdr: ChangeDetectorRef) {
  }

  private _tile!: ITileInfo;

  get tile() {
    return this._tile;
  }

  @Input()
  set tile(value: ITileInfo) {
    const needRefresh = value !== this._tile;
    this._tile = value;
    if (needRefresh) {
      this.requestWidgetList();
    }
  }

  ngOnInit() {
    this.subscribeForRouteChange();
    this.saveOriginalTiles();
    this.requestWidgetList();
  }


  ngOnDestroy() {
    this.ms.onEditDashboard.emit(false);
  }


  /**
   * Save tiles configuration to storage
   */
  saveTiles() {
    const settings = this.st.getTilesSettings();

    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const f = this.folder;

      // Create settings if not exists
      if (!settings[f]) {
        settings[f] = {};
      }
      if (!settings[f][tile.title]) {
        settings[f][tile.title] = {};
      }

      const conf = settings[f][tile.title];
      conf.row = tile.y;
      conf.col = tile.x;
      conf.sizeX = tile.cols;
      conf.sizeY = tile.rows;
      conf.color = tile.color;
      conf.fontColor = tile.fontColor;
      conf.icon = tile.icon;
      conf.hideTitle = tile.hideTitle;
      conf.customTitle = tile.customTitle;

      if (tile.widget !== null && tile.widget !== -1 && tile.widget !== undefined) {
        conf.widget = tile.widget;
      } else {
        delete conf.widget;
      }
    }

    this.st.setTilesSettings(settings);
  }

  /**
   * Set tile background color
   */
  setTileColor(c: number) {
    if (!this.tile) {
      return;
    }
    this.tile.color = c;
  }

  /**
   * Set tile font color
   */
  setFontColor(c: number) {
    if (!this.tile) {
      return;
    }
    this.tile.fontColor = c;
  }

  /**
   * Set tile icon
   */
  setIcon(c: number) {
    if (!this.tile) {
      return;
    }
    this.tile.icon = c;
  }

  /**
   * On cancel button click
   */
  onCancelEditing() {
    this.restoreOriginalTiles();
    this.close();
  }

  /**
   * On save button click
   */
  onSaveTiles() {
    this.saveTiles();
    this.st.onTilesChanged.emit();
    this.close();
  }

  /**
   * Close sidebar and stop editing
   */
  close() {
    this.sbs.hide();
  }

  /**
   * Saves original tiles as string to be able make cancel
   */
  private saveOriginalTiles() {
    this.originalTiles = JSON.stringify(this.tiles);
  }

  /**
   * Restores original tiles on cancel
   */
  private restoreOriginalTiles() {
    this.tiles.splice(0, this.tiles.length);
    const old: ITileInfo[] = JSON.parse(this.originalTiles);
    old.forEach(t => this.tiles.push(t));
  }

  /**
   * Request widget list for editing tile
   */
  private requestWidgetList() {
    this.model.widgetList = [];
    if (this.tile && !this.tile.isFolder) {
      this.ds.getWidgets(this.tile.fullPath).then((data) => this.fillWidgetList(data));
    }
  }

  /**
   * Fills widget list
   */
  private fillWidgetList(data: { widgets: any[] }) {
    if (data) {
      this.model.widgetList = data.widgets.map((w, n) => {
        return {idx: n, name: w.title || w.name};
      });
      this.model.widgetList = [{idx: -1, name: ''}, ...this.model.widgetList];
      this.cdr.detectChanges();
    }
  }

  private subscribeForRouteChange() {
    // Cancel editing on any navigation
    this.subRouteChange
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => this.onCancelEditing());
  }
}
