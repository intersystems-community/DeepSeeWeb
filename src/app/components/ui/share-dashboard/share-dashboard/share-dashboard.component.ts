import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UtilService} from "../../../../services/util.service";

@Component({
    selector: 'dsw-share-dashboard',
    templateUrl: './share-dashboard.component.html',
    styleUrls: ['./share-dashboard.component.scss']
})
export class ShareDashboardComponent implements OnDestroy {
    @Input() title = 'Share dashboard';
    @Input() btnTitle = 'Copy link';
    @Input() shareUrl = '';
    @Input() isSmall = false;
    onCopy = () => {};
    isCopied = false;
    timeout = 0;

    constructor(private us: UtilService) {
    }

    onCopyClick() {
        this.us.copyToClipboard(this.shareUrl);
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
}
