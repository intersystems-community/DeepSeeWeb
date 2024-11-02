import {Component, input, OnInit} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import markdownit from 'markdown-it';

@Component({
  selector: 'dsw-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true
})
export class AboutComponent implements OnInit {
  html = input.required<string>();
  protected changelog?: SafeHtml;

  constructor(private ds: DataService,
              private san: DomSanitizer) {
  }

  ngOnInit() {
    this.changelog = markdownit({html: true}).render(this.html());
  }
}
