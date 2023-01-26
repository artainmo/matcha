import { Component, Input, OnInit } from '@angular/core';
import { IMoreInfos } from "./more-info.interface";
import { HttpClient } from "@angular/common/http";
import { URL_MORE_INFOS } from "../../../../config/urls";
import { Router } from "@angular/router";

@Component({
  selector: 'app-more-profile-infos',
  templateUrl: './more-profile-infos.component.html',
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
