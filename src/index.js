import './styles.css';

import Storage from './modules/storage.js';
import DOM from './modules/dom.js';
import DragDrop from './modules/dragdrop.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, инициализирую приложение...');
  
  try {
    const storage = Storage;
    const dragDrop = new DragDrop();
    const dom = new DOM(storage, dragDrop);
    
    dom.init();
    
    console.log('Приложение успешно инициализировано');
  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error);
  }
});