import { Component, ChangeDetectorRef } from '@angular/core';
import { FotoService } from '../services/foto.service';
import { Foto } from '../models/foto.interface'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor( public fotoService: FotoService, private cdr: ChangeDetectorRef) {}

  addPhotoToGallery(){
    this.fotoService.addNewToGallery()
  }

    async ngOnInit() {
      await this.fotoService.loadSaved()
    }


    async deletePhoto2(photo: Foto) {
      await this.fotoService.deletePhoto(photo);
    }

    async deletePhoto(photo: Foto) {
      try {
        await this.fotoService.deletePhoto(photo);
        // Forzar la detección de cambios para actualizar la vista
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error al eliminar la foto:', error);
      }
    }

}
