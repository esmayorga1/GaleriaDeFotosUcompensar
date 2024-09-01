import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, CameraPhoto, Photo } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { Foto } from '../models/foto.interface'

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  public photos: Foto[] = []
  private PHOTO_STORAGE: string = "fotos"

  constructor() { }

  public async addNewToGallery() {
    
    /*
    // tomar foto
    const photoCamera = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })*/


    /*
    if (photoCamera.webPath) {
      // Añadir la foto a la lista
      this.photos.unshift({
        filepath: photoCamera.webPath, 
        webviewPath: photoCamera.webPath 
      });
    } else {
      console.error('La ruta web de la foto es indefinida.');
    }
  }*/

 // Tomar foto
 const photo = await Camera.getPhoto({
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
  quality: 100
});

// Verificar si webPath está definido
if (photo.webPath) {
  // Guardar la foto y añadirla a la lista
  const savedImageFile = await this.savePhoto(photo);
  this.photos.unshift(savedImageFile);
} else {
  console.error('La ruta web de la foto es indefinida.');
}
}

private async savePhoto(photo: Photo): Promise<Foto> {
// Convertir la foto a base64
const base64Data = await this.readAsBase64(photo);

// Generar un nombre único para el archivo
const fileName = new Date().getTime() + '.jpeg';

// Guardar la foto en el directorio 'Data'
const savedFile = await Filesystem.writeFile({
  path: fileName,
  data: base64Data,
  directory: Directory.Data
});

// Devolver la foto guardada
return {
  filepath: savedFile.uri,
  webviewPath: photo.webPath || '' // Proporcionar un valor por defecto vacío
};
}

private async readAsBase64(photo: Photo): Promise<string> {
// Descargar la imagen desde la URI
const response = await fetch(photo.webPath!);
const blob = await response.blob();

// Convertir el blob a base64
return new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    // Obtener el resultado base64 del lector de archivos
    resolve(reader.result as string);
  };
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});
}

public async loadSaved(){
  // recuperar las fotos de la cache

  const listPhotos = await Preferences.get({key: this.PHOTO_STORAGE})
  this.photos = JSON.parse(listPhotos.value || '') 

  // desplegar las fotos leidas formato base64
  for (let photo of this.photos){
    const readFile = await Filesystem.readFile({
      path: photo.filepath,
      directory: Directory.Data
    })
  }

    // solo para plataforma web: Cargar las fotos en base64
  this.photos.webviewPath = 'data:image/jpej; base64 ${readFile.data}'


}














































/*
  const savedImageFile = await this.savePhoto(photoCamera)
  this.photos.unshift(savedImageFile)
  
  public async savePhoto(cameraPhoto: CameraPhoto){
    const base64Data = await this.readASBase64(cameraPhoto)
    const fileName = new Date().getTime + '.jpeg'
    const saveFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data

    })

    return await this.{

    }

    convertBlobTobase64 = (blob: Blob) => new Promise(resolve, reject) => {
      const read = fileReader
      reder.enerror = reject

      Reader.onload() => 

    }
  }

  public readASBase64(cameraPhoto: CameraPhoto){
    const response = await fetch (cameraPhoto.webPath!)
    const blob = await response.blob()
  }*/
}