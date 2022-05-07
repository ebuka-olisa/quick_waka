import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DropzoneConfigInterface, DropzoneDirective } from 'ngx-dropzone-wrapper';

@Component({
    selector: 'app-profile-pic',
    templateUrl: './profile-pic.component.html',
    styleUrls: ['./profile-pic.component.css']
})
export class ProfilePicComponent implements OnInit {

    @Input()
    set config(config: any) {
        this._config = config;
        this.reset();
        if (this._config.photoUrl && this._config.photoUrl !== '') {
            if (!this.isLoaded) {
                setTimeout(x => {
                    this.loadMockPicture(this._config.photoUrl);
                }, 400);
            } else {
                this.loadMockPicture(this._config.photoUrl);
            }
        }
    }
    get config(): any { return this._config; }
    _config: any;
    Picture = null;

    PictureText: string;

    pictureRemoved: boolean;
    isLoaded: boolean;
    replacementInProgress: boolean;
    newPictureSelected: boolean;

    @ViewChild(DropzoneDirective, {static: false}) directiveRef: DropzoneDirective;

    cssClass: string;

    dropZoneConfig: DropzoneConfigInterface = {
        url: '/post',
        acceptedFiles: 'image/*',
        uploadMultiple: false,
        maxFiles: 1,
        clickable: true,
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: 'Drop picture here or click'
    };

    constructor() { }

    ngOnInit() {
        if (this.config.cssClass !== undefined) {
            this.cssClass = this.config.cssClass;
        }

        if (this.config.pictureText !== undefined) {
            this.PictureText = this.config.pictureText;
            this.dropZoneConfig.dictDefaultMessage = `Drop ${this.PictureText} here or click`;
        } else {
            this.PictureText = 'picture';
        }

        /*if (this.config.photoUrl && this.config.photoUrl !== '') {
            if (!this.isLoaded) {
                setTimeout(x => {
                    this.loadMockPicture(this.config.photoUrl);
                }, 400);
            } else {
                this.loadMockPicture(this.config.photoUrl);
            }
        }*/
    }

    fileAdded(file) {
        let sameFile = false;
        if (this.Picture !== null && this.Picture.name === file.name && this.Picture.size === file.size) {
            sameFile = true;
        }

        if (!sameFile) {

            // indicate that a file has been selected as fresh
            if (this.Picture) {
                this.newPictureSelected = true;
            }

            this.Picture = file;

            // replace picture if one is already being displayed
            const dz = this.directiveRef.dropzone();
            if ( dz.files[1] ) { // we check to see if we have added a file to the files array
                this.replacementInProgress = true;
                dz.removeFile( dz.files[0] ); // remove the existing file from the files array
            }
        }
    }

    fileRemoved() {
        if (!this.replacementInProgress) {
            if (this.Picture) {
                this.pictureRemoved = true;
                this.Picture = null;
            }
            this.newPictureSelected = false;
        } else {
            this.replacementInProgress = false;
        }
    }

    loadMockPicture(photoUrl: string) {
        this.isLoaded = true;
        const dz = this.directiveRef.dropzone();
        const mockFile = {
            name: 'Filename',
            size: 1234,
            accepted: true
        };
        if (dz.files.length > 0) {
            dz.removeAllFiles();
        }
        dz.files.push(mockFile);
        dz.emit('addedfile', mockFile);
        dz.emit('thumbnail', mockFile, photoUrl);
        dz.emit('complete', mockFile);
    }

    changePicture() {
        const dz = this.directiveRef.dropzone();
        dz.hiddenFileInput.click();
    }

    reset() {
        const dz = this.directiveRef ? this.directiveRef.dropzone() : null;
        if (dz && dz.files[0]) {
            dz.removeFile(dz.files[0]);
            this.Picture = null;
            this.newPictureSelected = false;
        }
    }
}
