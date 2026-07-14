import { Component, Input, OnInit } from '@angular/core';
import { IMoreInfos } from "./more-info.interface";
import { HttpClient } from "@angular/common/http";
import { URL_MORE_INFOS } from "../../../../config/urls";
import { Router } from "@angular/router";

import { MatChipSet, MatChip, MatChipRemove } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-more-profile-infos',
    templateUrl: './more-profile-infos.component.html',
    imports: [MatChipSet, MatChip, MatChipRemove, MatIcon, MatProgressSpinner]
})
export class MoreProfileInfosComponent implements OnInit {

  moreInfos: IMoreInfos | null = null;

  loading = true;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.http.get<IMoreInfos>(URL_MORE_INFOS).subscribe(
      (res: IMoreInfos) => {
        this.moreInfos = res;
        this.loading = false;
      }
    );
  }

	open(visit: string) {
		this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
			this.router.navigate(['profile', visit]).then();
		});
	}
}
