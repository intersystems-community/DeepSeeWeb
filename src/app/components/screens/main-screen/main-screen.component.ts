import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {HeaderService} from '../../../services/header.service';
import { DashboardScreenComponent } from '../dashboard-screen/dashboard-screen.component';
import { FolderScreenComponent } from '../folder-screen/folder-screen.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'dsw-main-screen',
    templateUrl: './main-screen.component.html',
    styleUrls: ['./main-screen.component.scss'],
    standalone: true,
    imports: [NgIf, FolderScreenComponent, DashboardScreenComponent]
})
export class MainScreenComponent implements OnInit, OnDestroy {
    isFolder = true;
    private subRoutechange: Subscription;

    constructor(private route: ActivatedRoute, private hs: HeaderService) {
        this.hs.visible$.next(true);
        this.subRoutechange = combineLatest([
            this.route.url,
            this.route.params
        ]).subscribe(([segments, params]) => {
            const path = [params.name, ...segments.map(s => s.path)].join('/');
            this.isFolder = path.indexOf('.dashboard') === -1;
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subRoutechange.unsubscribe();
    }

}
