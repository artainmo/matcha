import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import {AccountService} from "../../../services/account.service";
import {IProfile} from "../../../models/user.model";

@Component({
	selector: 'app-consult',
	templateUrl: './consult.component.html',
})
export class ConsultComponent implements OnInit {

  isMyProfile: boolean = false;
  profile!: IProfile;
  loading = true;
  disableLikeAccount = false;
  private username: string = '';

	constructor(
    private readonly route: ActivatedRoute,
    private readonly accountService: AccountService,
    private readonly router: Router,
    private readonly cdRef: ChangeDetectorRef
  ) {
	}

	ngOnInit(): void {
		this.loadInfos();
  }

	private loadInfos() {
		this.loading = true;
		this.username = this.route.snapshot.paramMap.get('id') ?? '';
		this.accountService.getProfile(this.username).subscribe(
			(profile: string | IProfile) => {
				if (typeof profile == 'string') return;
				this.profile = profile;
				const index = this.profile.pictures?.indexOf(this.profile.profile_picture);
				if (index != undefined && index > -1) {
					this.profile.pictures?.splice(index, 1);
				}
				this.loading = false;
			}
		);
		this.isMyProfile =
			(this.route.snapshot.paramMap.get('id') ?? '') === this.accountService.activeUsername;
	}

  likeProfile() {
    this.disableLikeAccount = true;
    this.accountService.likeProfile(this.route.snapshot.paramMap.get('id') ?? '').subscribe(
      () => {
	      this.disableLikeAccount = false;
				this.loadInfos();
      }, () => {
		    this.disableLikeAccount = false;
			}
    );
  }

  dislikeProfile() {
	  this.disableLikeAccount = true;
    this.accountService.dislikeProfile(this.route.snapshot.paramMap.get('id') ?? '').subscribe(
      () => {
	      this.disableLikeAccount = false;
	      this.loadInfos();
      }, () => {
		    this.disableLikeAccount = false;
	    }
    );
  }

	blockProfile() {
    this.loading = true;
    this.accountService.blockProfile(this.route.snapshot.paramMap.get('id') ?? '').subscribe(
	    () => {
		    this.router.navigate(['/discover']).then();
	    },
			() => {
				this.loading = false;
	    }
    );
  }

	reportAsFake() {
    this.loading = true;
    this.accountService.reportAsFake(this.route.snapshot.paramMap.get('id') ?? '').subscribe(
	    () => {
		    this.loadInfos();
	    },
	    () => {
		    this.loading = false;
	    }
    );
  }
}
