import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, OnInit, Renderer2} from '@angular/core';
import {ISidebarInfo, SidebarService} from '../../../services/sidebar.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {NgComponentOutlet} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export const SIDEBAR_TOGGLE_ANIMATION = trigger(
  'toggle', [
    transition(':enter', [
      style({maxWidth: '0'}),
      animate('100ms', style({maxWidth: '*'}))
    ]),
    transition(':leave', [
      style({maxWidth: ''}),
      animate('100ms', style({maxWidth: '0'}))
    ])
  ]
);

@Component({
  selector: 'dsw-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    NgComponentOutlet
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  info?: ISidebarInfo;
  private component?: ComponentRef<any>;
  private sidebarToggle$ = this.ss.sidebarToggle.pipe(takeUntilDestroyed());

  constructor(private ss: SidebarService,
              private r2: Renderer2,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.sidebarToggle$.subscribe(info => {
      this.info = info;
      this.cd.detectChanges();
      if (info === null) {
        return;
      }
      // Check if component of same type already created
      /*if (!this.com this.component && this.component.componentType === info.component) {
          // Only update properties
      } else {*/
      // Create new component and destroy old
      // this.removeComponent();
      /*if (this.container.length) {
          // @ts-ignore
          /!*const el = this.container.get(0).rootNodes[0];
          this.r2.removeStyle(el, 'transform');
          this.r2.addClass(el, 'go-out');
          this.r2.removeClass(el, 'go-in');*!/
          this.container.detach(0);
      }
      if (info.compRef) {
          this.container.insert(info.compRef.hostView, 0);
          /!*const el = info.compRef.location.nativeElement;
          this.r2.setStyle(el, 'transform', 'translateX(-100%)')
          this.r2.addClass(el, 'go-in');*!/
      } else {
          info.compRef = this.createComponent(info);
          /!*const el = info.compRef.location.nativeElement;
          this.r2.setStyle(el, 'transform', 'translateX(-100%)');
          setTimeout(() => {
              this.r2.addClass(el, 'go-in');
          });*!/
      }*/
      // }
    });
  }
}
