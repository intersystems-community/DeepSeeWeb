import {Component} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as markdownit from 'markdown-it';

@Component({
    selector: 'dsw-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: true
})
export class AboutComponent {
    changelog?: SafeHtml;

    constructor(private ds: DataService,
                private san: DomSanitizer) {
        this.ds.getFile('changelog.md')
            .then(html => {
                this.changelog = markdownit({html: true}).render(html);
            });
    }
}
