import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {Subscription} from 'rxjs';
import {ISidebarInfo, SidebarService} from '../../../services/sidebar.service';
import {animate, style, transition, trigger} from '@angular/animations';

export const SIDEBAR_TOGGLE_ANIMATION = trigger(
    'toggle', [
        transition(':enter', [
            style({transform: 'translateX(-100%)'}),
            animate('100ms', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0)'}),
            animate('100ms', style({transform: 'translateX(-100%)'}))
        ])
    ]
);

@Component({
    selector: 'dsw-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

    @ViewChild('container', {read: ViewContainerRef, static: true})
    container: ViewContainerRef;

    private component: ComponentRef<any>;
    private subSidebarToggle: Subscription;

    constructor(private ss: SidebarService,
                private r2: Renderer2,
                private cfr: ComponentFactoryResolver) {
    }

    ngOnInit() {
        this.subSidebarToggle = this.ss.sidebarToggle.subscribe((info: ISidebarInfo) => {
            if (info === null) {
                return;
            }
            // Check if component of same type already created
            /*if (!this.com this.component && this.component.componentType === info.component) {
                // Only update properties
                this.updateComponentProperties(info);
                if (this.component.instance.cd) {
                    this.component.instance.cd.markForCheck();
                    this.component.instance.cd.detectChanges();
                }
            } else {*/
            // Create new component and destroy old
            // this.removeComponent();
            if (this.container.length) {
                // @ts-ignore
                /*const el = this.container.get(0).rootNodes[0];
                this.r2.removeStyle(el, 'transform');
                this.r2.addClass(el, 'go-out');
                this.r2.removeClass(el, 'go-in');*/
                this.container.detach(0);
            }
            if (info.compRef) {
                this.container.insert(info.compRef.hostView, 0);
                /*const el = info.compRef.location.nativeElement;
                this.r2.setStyle(el, 'transform', 'translateX(-100%)')
                this.r2.addClass(el, 'go-in');*/
            } else {
                info.compRef = this.createComponent(info);
                /*const el = info.compRef.location.nativeElement;
                this.r2.setStyle(el, 'transform', 'translateX(-100%)');
                setTimeout(() => {
                    this.r2.addClass(el, 'go-in');
                });*/
            }
            // }
        });
    }

    ngOnDestroy() {
        this.subSidebarToggle.unsubscribe();
    }

    /**
     * Creates dynamic component on sidebar
     */
    private createComponent(info: ISidebarInfo) {
        const factory = this.cfr.resolveComponentFactory(info.component);
        this.component = this.container.createComponent(factory);
        this.updateComponentProperties(info);
        return this.component;
    }

    /**
     * Updates dynamic component properties
     */
    private updateComponentProperties(info: ISidebarInfo) {
        if (info.inputs) {
            for (const prop in info.inputs) {
                this.component.instance[prop] = info.inputs[prop];
            }
        }
    }

    /**
     * Removes dynamic component from sidebar
     */
    public removeComponent() {
        if (!this.component) {
            return;
        }
        this.component.destroy();
        this.component = null;
    }

}
