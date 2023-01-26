import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PictureService } from './picture.service';
import { AccountService } from "../../../../services/account.service";

@Component({
	selector: 'app-picture-selection',
	templateUrl: './picture-selection.component.html',
	styleUrls: ['./picture-selection.component.css']
})
export class PictureSelectionComponent implements OnInit {

	@Input()
	preset_favorite: string | undefined;

	@Output() favorite: EventEmitter<string> = new EventEmitter<string>();

	_files: string[] = [];
	_favorite: string = '';

	_loadingFileIndexes: number[] = [];

	fileUploadLoading = false;

	constructor(
		private readonly pictureService: PictureService,
    private readonly accountService: AccountService
	) {
	}

	ngOnInit(): void {
		this.pictureService.getPictures().subscribe(
			(files: [path: string, user: string][]) => {
				this._files = files.map<string>((f) => f[0]);
				this._favorite = this.preset_favorite ? this.preset_favorite : '';
			},
			() => {
				this._files = [];
			}
		)
	}

	setFavorite(fav: string) {
		this._favorite = fav;
		this.favorite.emit(fav);
	}

	uploadFile(fileInputEvent: any) {
		this.fileUploadLoading = true;
		const file: File = fileInputEvent.target.files[0];
		if (!file) {
			this.fileUploadLoading = false;
			return;
		}
		this.pictureService.uploadPicture(file).subscribe(
			() => {
        this._files?.push('images/' + this.accountService.activeUsername +  '/' + file.name);
        this.fileUploadLoading = false;
			},
			(e: any) => {
				console.log(e);
        this.fileUploadLoading = false;
			}
		);
	}

	removeFile(i: number) {
		this._loadingFileIndexes.push(i);
		const fileToDelete = this._files[i];
		const wasFavorite = (fileToDelete === this._favorite);
		this.pictureService.deletePicture(fileToDelete).subscribe(
			() => {
				if (wasFavorite) {
					this.setFavorite('');
				}
				this._loadingFileIndexes.splice(this._loadingFileIndexes.indexOf(i), 1);
				this._files.splice(i, 1);
				if (wasFavorite && this._files.length > 0) {
					this.setFavorite(this._files[0]);
				}
			},
			() => {
				this._loadingFileIndexes.splice(this._loadingFileIndexes.indexOf(i), 1);
			}
		);
	}
}
