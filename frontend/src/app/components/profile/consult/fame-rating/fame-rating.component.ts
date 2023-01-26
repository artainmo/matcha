import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { URL_FAME } from "../../../../config/urls";

@Component({
  selector: 'app-fame-rating',
  templateUrl: './fame-rating.component.html'
})
export class FameRatingComponent implements OnInit {

  @Input()
  username: string = '';

  fame: number | null = null;

  loading = true;

  constructor(
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get<number>(URL_FAME(this.username)).subscribe(
      (res: number) => {
        this.fame = res;
        this.loading = false;
      }
    );
  }

}
