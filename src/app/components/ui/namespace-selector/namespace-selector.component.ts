import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {CURRENT_NAMESPACE, NamespaceService} from '../../../services/namespace.service';
import {Router} from '@angular/router';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'dsw-namespace-selector',
  templateUrl: './namespace-selector.component.html',
  styleUrls: ['./../menu/menu.component.scss'],
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamespaceSelectorComponent {

  items: string[] = [];
  isLoading = true;

  constructor(private ss: SidebarService,
              private ns: NamespaceService,
              private ds: DataService,
              private cdr: ChangeDetectorRef,
              private router: Router) {
    this.requestData();
  }

  /**
   * Select namespace callback
   */
  selectNamespace(ns: string) {
    this.ns.setCurrent(ns);
    void this.router.navigateByUrl(ns);
    this.ss.hide();
  }

  /**
   * Returs true if namespace selected
   */
  isSelected(ns: string) {
    return ns.toLowerCase() === CURRENT_NAMESPACE.toLowerCase();
  }

  private requestData() {
    this.ds.getSettings(CURRENT_NAMESPACE)
      .then((settings: any) => {
        this.ns.setNamespaces(settings.Mappings.Mapped);
      })
      .finally(() => {
        this.isLoading = false;
        this.items = this.ns.getNamespaces();
        this.cdr.detectChanges();
      });
  }
}
