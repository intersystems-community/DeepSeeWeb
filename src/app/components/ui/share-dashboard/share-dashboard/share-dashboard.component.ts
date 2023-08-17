import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UtilService} from "../../../../services/util.service";
import {StorageService} from "../../../../services/storage.service";

@Component({
    selector: 'dsw-share-dashboard',
    templateUrl: './share-dashboard.component.html',
    styleUrls: ['./share-dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDashboardComponent implements OnInit, OnChanges, OnDestroy {
    @Input() title = 'Share dashboard';
    @Input() btnTitle = 'Copy link';
    @Input() shareUrl = '';
    @Input() isSmall = false;
    onCopy = () => {};
    isCopied = false;
    timeout = 0;
    asBase64 = false;
    url = '';

    constructor(private us: UtilService,
                private ss: StorageService) {
        this.asBase64 = this.ss.storage.getItem('dsw-share-format-base64') === '1';
    }

    ngOnInit() {
        this.convertLink();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['shareUrl'].previousValue !== changes['shareUrl'].currentValue) {
            this.convertLink();
        }
    }

    onCopyClick() {
        this.us.copyToClipboard(this.url);
        this.isCopied = true;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.isCopied = false;
        }, 2000);

        this.onCopy();
    }

    ngOnDestroy() {
        clearTimeout(this.timeout);
    }

    onFormatChange() {
        this.ss.storage.setItem('dsw-share-format-base64', this.asBase64 ? '1' : '0');
        this.convertLink();
    }

    private convertLink() {
        this.url = this.shareUrl;
        if (this.asBase64) {
            const parts = this.shareUrl.split('?');
            const query = parts[1];
            if (!query) {
                return;
            }
            let params = query.split('&');
            params = params.map(p => {
                const pa = p.split('=');
                if (pa[0] === 'FILTERS') {
                    pa[1] = btoa(pa[1]);
                    return pa.join('=');
                } else {
                    return p;
                }
            });
            parts[1] = params.join('&');
            this.url = parts.join('?');
        } else {
            this.url = this.shareUrl;
        }
    }
}
