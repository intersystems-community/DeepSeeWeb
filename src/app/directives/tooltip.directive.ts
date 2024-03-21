import {AfterViewInit, Attribute, Directive, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
    @Input('tooltip') tooltip = '';
    private tooltipEl: HTMLDivElement|null = null;
    private onHover = (e: MouseEvent) => this.showTooltip(e);
    private onOut = (e: MouseEvent) => this.removeTooltip();

    constructor(private el: ElementRef) {
    }

    ngAfterViewInit() {
        this.el.nativeElement.addEventListener('mouseover', this.onHover);
        this.el.nativeElement.addEventListener('mouseout', this.onOut);
    }

    private showTooltip(e: MouseEvent) {
        if (this.tooltipEl) {
            return;
        }
        this.createTooltip();

        if (!this.tooltipEl) {
            return;
        }

        // Position the tooltip based on mouse cursor position
        const x = e.clientX;
        const y = e.clientY;

        // Check if the tooltip is intersecting with screen edges
        const tooltipWidth = (this.tooltipEl as HTMLDivElement).offsetWidth;
        const tooltipHeight = (this.tooltipEl as HTMLDivElement).offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Adjust tooltip position if it's intersecting with screen edges
        let tooltipX = x;
        let tooltipY = y;

        if (x + tooltipWidth > screenWidth) {
            tooltipX = x - tooltipWidth;
        }

        if (y + tooltipHeight > screenHeight) {
            tooltipY = y - tooltipHeight;
        }

        // Position the tooltip
        if (this.tooltipEl) {
            (this.tooltipEl as HTMLDivElement).style.left = tooltipX + 'px';
            (this.tooltipEl as HTMLDivElement).style.top = tooltipY + 'px';
        }
    }

    private removeTooltip() {
        if (!this.tooltipEl) {
            return;
        }
        this.tooltipEl.parentNode?.removeChild(this.tooltipEl);
        this.tooltipEl = null;
    }

    private createTooltip() {
        this.removeTooltip();

        this.tooltipEl = document.createElement('div');
        this.tooltipEl.classList.add('dsw-tooltip');

        this.tooltipEl.innerHTML = this.tooltip;

        document.body.appendChild(this.tooltipEl);
    }

    ngOnDestroy() {
        this.el.nativeElement.removeEventListener('mouseover', this.onHover);
        this.el.nativeElement.removeEventListener('mouseout', this.onOut);
        this.removeTooltip();
    }
}
