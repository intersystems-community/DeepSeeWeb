import {AfterViewInit, Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {BaseWidget} from '../app/components/widgets/base-widget.class';
import {IAddonInfo} from "../app/services/dsw.types";

@Component({
    selector: 'dsw-simple-addon',
    standalone: true,
    template: `
        <h2>Hello, this is simple addon component</h2>
        <button (click)="requestData()">Refresh</button>
        <canvas #canvas></canvas>
    `,
    styles: [`
        :host {
            padding: 10px;
        }

        h1 {
            color: green;
        }

        canvas {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            pointer-events: none;
        }
    `]
})
export class SimpleAddon extends BaseWidget implements OnInit, AfterViewInit {
    static AddonInfo: IAddonInfo = {
        // Widget type
        // 'custom' for all non-standard widgets
        // 'chart' for highcharts widget
        type: 'custom'
    };
    @ViewChild('canvas') canvas?: ElementRef;

    /**
     * Initialization
     */
    ngOnInit() {
        super.ngOnInit();
        // Initialize addon here
        console.log('Hello!');
    }

    /**
     * Initialization after DOM element has been created and accessible
     */
    ngAfterViewInit() {
        // Here you can access this.el.nativeElement, to manipulate DOM
        this.drawOnCanvas();
    }

    /**
     * Draw on canvas
     */
    drawOnCanvas() {
        const canvas = this.canvas?.nativeElement as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (!ctx) {
          return;
        }
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.ellipse(x, y, Math.min(x, y), Math.min(x, y), 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * Request data from server if needed
     */
    requestData() {
        super.requestData();
        // You can make you own data request here if it not supposed to run MDX
        // Or you need to call external REST API
    }

    /**
     * Parse retrieved data
     */
    retrieveData(data: any) {
        super.retrieveData(data);
        // Here you can parse data, and display it as needed
        // data - is MDX result
        if (data.Error) {
            return;
        }

        console.log(data);
    }

    /**
     * Drilldown processing
     */
    doDrill(path?: string, name?: string, category?: string, noDrillCallback?: () => void): Promise<unknown> {
        return super.doDrill(path, name, category, noDrillCallback);
    }

    /**
     * Drillup processing
     */
    doDrillUp() {
        super.doDrillUp();
    }

    /**
     * Resize callback
     */
    onResize() {
        // Use to redraw widget after resize event
        super.onResize();

        // Adjust canvas size to new widget size
        const canvas = this.canvas?.nativeElement;
        if (!canvas) {
          return;
        }
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Redraw
        this.drawOnCanvas();
    }
}
