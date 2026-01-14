export default class DragDrop {
  constructor() {
    this.draggedCard = null;
    this.draggedCardElement = null;
    this.dragStartColumn = null;
    this.dragStartIndex = null;
  }

  init(dom) {
    this.dom = dom;
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => this.onDragStart(e));
    document.addEventListener('dragover', (e) => this.onDragOver(e));
    document.addEventListener('dragenter', (e) => this.onDragEnter(e));
    document.addEventListener('dragleave', (e) => this.onDragLeave(e));
    document.addEventListener('drop', (e) => this.onDrop(e));
    document.addEventListener('dragend', (e) => this.onDragEnd(e));
  }

  onDragStart(e) {
    if (!e.target.classList.contains('card')) return;
    
    this.draggedCardElement = e.target;
    this.draggedCard = this.dom.getCard(this.draggedCardElement.dataset.cardId);
    
    if (!this.draggedCard) return;
    
    // Найти исходную колонку и индекс
    const startColumnElement = this.draggedCardElement.closest('.cards');
    this.dragStartColumn = startColumnElement.dataset.columnId;
    const cards = Array.from(startColumnElement.querySelectorAll('.card'));
    this.dragStartIndex = cards.indexOf(this.draggedCardElement);
    
    // Установить данные для передачи
    e.dataTransfer.setData('text/plain', this.draggedCard.id);
    
    // Визуальный эффект
    this.draggedCardElement.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    
    // Установить курсор
    document.body.style.cursor = 'grabbing';
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  onDragEnter(e) {
    e.preventDefault();
    
    const target = e.target;
    
    // Определяем целевой элемент для вставки
    if (target.classList.contains('card')) {
      this.showDropIndicator(target, 'before');
    } else if (target.classList.contains('cards')) {
      this.showDropIndicator(target, 'inside');
    }
  }

  onDragLeave(e) {
    // Убираем индикаторы
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  onDrop(e) {
    e.preventDefault();
    
    if (!this.draggedCard) return;
    
    const target = e.target;
    let targetColumn = null;
    let insertIndex = null;
    
    // Определяем целевую колонку и позицию
    if (target.classList.contains('card')) {
      const cardElement = target;
      const columnElement = cardElement.closest('.cards');
      targetColumn = columnElement.dataset.columnId;
      
      // Определяем индекс вставки
      const cards = Array.from(columnElement.querySelectorAll('.card'));
      const targetIndex = cards.indexOf(cardElement);
      
      // Определяем, куда вставлять: до или после карточки
      const rect = cardElement.getBoundingClientRect();
      const dropPosition = e.clientY - rect.top;
      
      if (dropPosition < rect.height / 2) {
        insertIndex = targetIndex;
      } else {
        insertIndex = targetIndex + 1;
      }
    } else if (target.classList.contains('cards')) {
      targetColumn = target.dataset.columnId;
      // Если бросаем в пустую колонку, вставляем в конец
      const cards = Array.from(target.querySelectorAll('.card'));
      insertIndex = cards.length;
    } else {
      return false;
    }
    
    if (targetColumn) {
      this.dom.moveCard(
        this.draggedCard.id,
        this.dragStartColumn,
        targetColumn,
        insertIndex
      );
    }
    
    // Убираем индикаторы
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    
    return false;
  }

  onDragEnd(e) {
    // Восстанавливаем стили
    if (this.draggedCardElement) {
      this.draggedCardElement.style.opacity = '';
    }
    
    // Восстанавливаем курсор
    document.body.style.cursor = '';
    
    // Убираем индикаторы
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    
    // Сбрасываем состояние
    this.draggedCard = null;
    this.draggedCardElement = null;
    this.dragStartColumn = null;
    this.dragStartIndex = null;
  }

  showDropIndicator(element, position) {
    // Убираем все предыдущие индикаторы
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    
    // Добавляем индикатор к целевому элементу
    if (position === 'before' || position === 'inside') {
      element.classList.add('drag-over');
    }
  }
}