import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  visible$ = new BehaviorSubject(false);
  onSearch = new BehaviorSubject<string>('');
  onSearchReset = new EventEmitter();
  shareDashboardEmitter = new EventEmitter();
  gotoZenDeepSeeEmitter = new EventEmitter();
  mobileFilterToggle = new EventEmitter<boolean>();
  mobileFilterDialogToggle = new EventEmitter();

  // onSetTitle = new BehaviorSubject<string>('');

  constructor() {

  }

  resetSearch() {
    this.onSearchReset.emit();
  }

  shareDashboard() {
    this.shareDashboardEmitter.emit();
  }

  gotoZenDeepSee() {
    this.gotoZenDeepSeeEmitter.emit();
  }

  showMobileFilterButton() {
    this.mobileFilterToggle.emit(true);
  }

  hideMobileFilterButton() {
    this.mobileFilterToggle.emit(false);
  }

  toggleMobileFilterDialog() {
    this.mobileFilterDialogToggle.emit();
  }

}
