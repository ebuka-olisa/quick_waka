import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Photo } from 'src/app/models/vendor';

@Component({
    selector: 'app-multiple-pics',
    templateUrl: './multiple-pics.component.html',
    styleUrls: ['./multiple-pics.component.css']
})
export class MultiplePicsComponent implements OnInit {

    @Input()
    set config(config: any) {
        this._config = config;
        if (this._config.photos) {
            if (!this.isLoaded) {
                setTimeout(x => {
                    this.loadMockPicture(this._config.photos);
                }, 400);
            } else {
                this.loadMockPicture(this._config.photos);
            }
        }

        if (this._config.maxFiles) {
            this.dropZoneConfig.maxFiles = this._config.maxFiles;
        }
    }
    get config(): any { return this._config; }
    _config: any;

    @Output() picturesUpdated = new EventEmitter<any>();
    @Output() pictureDeleted = new EventEmitter<any>();

    Pictures = [];

    duplicatePicture: boolean;

    Error: string;

    isLoaded: boolean;

    /*PictureText: string;

    pictureRemoved: boolean;
    replacementInProgress: boolean;
    newPictureSelected: boolean;*/

    @ViewChild(DropzoneDirective, {static: false}) directiveRef: DropzoneDirective;

    cssClass: string;

    dropZoneConfig: DropzoneConfigInterface = {
        url: '/post',
        acceptedFiles: 'image/*',
        uploadMultiple: true,
        maxFiles: 5,
        clickable: true,
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: 'Drop pictures here or click'
    };

    constructor() { }

    ngOnInit() {
        if (this.config.cssClass !== undefined) {
            this.cssClass = this.config.cssClass;
        }

        if (this.config.photos) {
            if (!this.isLoaded) {
                setTimeout(x => {
                    this.loadMockPicture(this.config.photos);
                }, 400);
            } else {
                this.loadMockPicture(this.config.photos);
            }
        }
    }

    /*ngOnChanges(changes: SimpleChanges) {
        for (const property in changes) {
            if (property === 'config') {
                if (changes[property].previousValue.photos !== changes[property].currentValue.photos) {
                    console.log('change');
                }
            }
        }
    }*/

    fileAdded(file) {
        let sameFile = false;
        this.Pictures.some((obj) => {
            if (obj.name === file.name && obj.size === file.size) {
                sameFile = true;
                return true;
            }
        });

        if (!sameFile) {

            // indicate that a file has been selected as fresh
            /*if (this.Picture != null) {
                this.newPictureSelected = true;
            }*/

            this.Pictures.push(file);
            this.Error = '';
            this.picturesUpdated.emit(this.Pictures);

            // replace picture if one is already being displayed
            /*const dz = this.directiveRef.dropzone();
            if ( dz.files[1] != null ) { // we check to see if we have added a file to the files array
                this.replacementInProgress = true;
                dz.removeFile( dz.files[0] ); // remove the existing file from the files array
            }*/
        } else {
            this.duplicatePicture = true;
            this.removeFileFromScreen(file);
        }
    }

    fileRemoved(file) {
        if (this.duplicatePicture) {
            this.duplicatePicture = false;
        } else {
            const idx = this.Pictures.indexOf(file);
            if (this.Pictures[idx].photoId){
                this.pictureDeleted.emit(this.Pictures[idx].photoId);
            }
            this.Pictures.splice(idx, 1);
            this.picturesUpdated.emit(this.Pictures);
        }
    }

    removeFileFromScreen(file) {
        const dz = this.directiveRef.dropzone();
        dz.removeFile(file);
    }

    errorOccurred(file) {
        if (!file.accepted) {
            this.removeFileFromScreen(file[0]);
        }
    }

    loadMockPicture(photos: Photo[]) {
        this.isLoaded = true;
        const dz = this.directiveRef.dropzone();
        if (dz.files.length > 0) {
            dz.removeAllFiles();
        }
        for (const photo of photos) {
            const mockFile = {
                photoId: photo.id,
                name: 'pic_' + photo.id,
                size: 1234,
                accepted: true,
            };
            dz.files.push(mockFile);
            dz.emit('addedfile', mockFile);
            dz.emit('thumbnail', mockFile, photo.url);
            dz.emit('complete', mockFile);
        }
    }

}
