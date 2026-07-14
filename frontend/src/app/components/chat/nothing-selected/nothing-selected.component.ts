import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-nothing-selected',
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './nothing-selected.component.html'
})
export class NothingSelectedComponent implements OnInit {

	constructor() {
	}

	ngOnInit(): void {
	}

}
