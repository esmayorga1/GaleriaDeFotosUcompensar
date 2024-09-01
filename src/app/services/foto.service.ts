import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Foto } from '../models/foto.interface';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  public photos: Foto[] = [];
  private PHOTO_STORAGE: string = 'fotos';

  constructor() { }

  public async addNewToGallery() {
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

      // Guardar la lista de fotos en el almacenamiento local
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos)
      });
    } else {
      console.error('La ruta web de la foto es indefinida.');
    }
  }

  private async savePhoto(photo: Photo): Promise<Foto> {
    if (photo.webPath) {
      // Para la web, simplemente devolvemos la ruta web
      return {
        filepath: photo.webPath,
        webviewPath: photo.webPath
      };
    }

    // Convertir la foto a base64
    const base64Data = await this.readAsBase64(photo);

    // Generar un nombre único para el archivo
    const fileName = `${new Date().getTime()}.jpeg`;

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

  public async loadSaved() {
    // Recuperar las fotos del almacenamiento local
    const listPhotos = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(listPhotos.value || '[]'); // Si no hay fotos, devuelve un array vacío

    // Desplegar las fotos leídas en formato base64
    for (let photo of this.photos) {
      if (photo.filepath.startsWith('http')) {
        // Para la web, ya tenemos la ruta web directamente
        photo.webviewPath = photo.filepath;
      } else {
        // Para móvil, cargar las fotos en base64
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  public async deletePhoto(photo: Foto) {
    try {
      console.log('Intentando eliminar archivo:', photo.filepath);
  
      // Verificar si el archivo existe antes de intentar eliminarlo
      const fileExists = photo.filepath.startsWith('blob:http') || 
                         await Filesystem.stat({
                           path: photo.filepath,
                           directory: Directory.Data
                         }).then(() => true).catch(() => false);
  
      if (!fileExists) {
        console.error('Archivo no existe:', photo.filepath);
        return;
      }
  
      // Eliminar la foto del sistema de archivos
      if (!photo.filepath.startsWith('blob:http')) {
        await Filesystem.deleteFile({
          path: photo.filepath,
          directory: Directory.Data
        });
      }
  
      console.log('Archivo eliminado exitosamente.');
  
      // Actualizar la lista de fotos eliminando la foto borrada
      this.photos = this.photos.filter(p => p.filepath !== photo.filepath);
  
      console.log('Fotos después de la eliminación:', this.photos);
  
      // Guardar la lista actualizada de fotos en el almacenamiento local
      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos)
      });
  
      console.log('Lista de fotos actualizada en el almacenamiento local.');
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
    }
  }
}
