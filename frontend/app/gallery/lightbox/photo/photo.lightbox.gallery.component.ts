import {Component, ElementRef, Input, Output, OnChanges, ViewChild} from '@angular/core';
import {GridMedia} from '../../grid/GridMedia';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {FixOrientationPipe} from '../../FixOrientationPipe';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';

@Component({
  selector: 'app-gallery-lightbox-photo',
  styleUrls: ['./photo.lightbox.gallery.component.css'],
  templateUrl: './photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

  @Input() gridMedia: GridMedia;
  @Input() loadMedia = false;
  @Input() windowAspect = 1;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  prevGirdPhoto = null;

  public imageSize = {width: 'auto', height: '100'};

  private imageLoaded = false;
  public imageLoadFinished = false;

  thumbnailSrc: string = null;
  photoSrc: string = null;
  private videoProgress: number = 0;

  constructor(public elementRef: ElementRef) {
  }

  ngOnChanges() {
    this.imageLoaded = false;
    this.imageLoadFinished = false;
    this.setImageSize();
    if (this.prevGirdPhoto !== this.gridMedia) {
      this.prevGirdPhoto = this.gridMedia;
      this.thumbnailSrc = null;
      this.photoSrc = null;
    }
    if (this.thumbnailSrc == null && this.gridMedia && this.ThumbnailUrl !== null) {
      FixOrientationPipe.transform(this.ThumbnailUrl, this.gridMedia.Orientation)
        .then((src) => this.thumbnailSrc = src);
    }

    if (this.photoSrc == null && this.gridMedia && this.loadMedia) {
      FixOrientationPipe.transform(this.gridMedia.getPhotoPath(), this.gridMedia.Orientation)
        .then((src) => this.photoSrc = src);
    }


  }

  private onVideoProgress() {
    this.videoProgress = (100 / this.video.nativeElement.duration) * this.video.nativeElement.currentTime;
  }

  public get VideoProgress(): number {
    return this.videoProgress;
  }


  public get VideoVolume(): number {
    if (!this.video) {
      return 100;
    }
    return this.video.nativeElement.volume;
  }

  public set VideoVolume(value: number) {
    if (!this.video) {
      return;
    }
    this.video.nativeElement.muted = false;
    this.video.nativeElement.volume = value;
  }

  public set VideoProgress(value: number) {
    if (!this.video && value === null && typeof value === 'undefined') {
      return;
    }
    this.video.nativeElement.currentTime = this.video.nativeElement.duration * (value / 100);
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play().catch(console.error);
    }
  }


  public get Muted(): boolean {
    if (!this.video) {
      return true;
    }
    return this.video.nativeElement.muted;
  }

  public mute() {
    if (!this.video) {
      return;
    }

    this.video.nativeElement.muted = !this.video.nativeElement.muted;
  }

  public playPause() {
    if (!this.video) {
      return;
    }
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play().catch(console.error);
    } else {
      this.video.nativeElement.pause();
    }
  }

  public get Paused(): boolean {
    if (!this.video) {
      return true;
    }
    return this.video.nativeElement.paused;
  }

  onImageError() {
    // TODO:handle error
    this.imageLoadFinished = true;
    console.error('Error: cannot load image for lightbox url: ' + this.gridMedia.getPhotoPath());
  }


  onImageLoad() {
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  private get ThumbnailUrl(): string {
    if (this.gridMedia.isThumbnailAvailable() === true) {
      return this.gridMedia.getThumbnailPath();
    }

    if (this.gridMedia.isReplacementThumbnailAvailable() === true) {
      return this.gridMedia.getReplacementThumbnailPath();
    }
    return null;
  }

  public get PhotoSrc(): string {
    return this.gridMedia.getPhotoPath();
  }

  public showThumbnail(): boolean {
    return this.gridMedia &&
      !this.imageLoaded &&
      this.thumbnailSrc !== null &&
      (this.gridMedia.isThumbnailAvailable() || this.gridMedia.isReplacementThumbnailAvailable());
  }

  private setImageSize() {
    if (!this.gridMedia) {
      return;
    }


    const photoAspect = MediaDTO.calcRotatedAspectRatio(this.gridMedia.media);

    if (photoAspect < this.windowAspect) {
      this.imageSize.height = '100';
      this.imageSize.width = null;
    } else {
      this.imageSize.height = null;
      this.imageSize.width = '100';
    }
  }

}

