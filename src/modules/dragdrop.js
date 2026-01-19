export default class DragDrop {
  constructor() {
    this.draggedCard = null;
    this.draggedCardElement = null;
    this.dragStartColumn = null;
    this.dragStartIndex = null;
    this.isDragging = false;
    this.dropTarget = null;
    this.dropSpace = null;
  }

  init(dom) {
    this.dom = dom;
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('dragstart', (e) => this.onDragStart(e));
    document.addEventListener('dragover', (e) => this.onDragOver(e));
    document.addEventListener('dragenter', (e) => this.onDragEnter(e));
    document.addEventListener('dragleave', (e) => this.onDragLeave(e));
    document.addEventListener('drop', (e) => this.onDrop(e));
    document.addEventListener('dragend', (e) => this.onDragEnd(e));
  }

  onMouseDown(e) {
    const cardElement = e.target.closest('.card');
    if (cardElement && !e.target.closest('.delete-card')) {
      cardElement.draggable = true;
      const rect = cardElement.getBoundingClientRect();
      cardElement.dataset.dragOffsetX = e.clientX - rect.left;
      cardElement.dataset.dragOffsetY = e.clientY - rect.top;
    }
  }

  onDragStart(e) {
    const cardElement = e.target.closest('.card');
    if (!cardElement || e.target.closest('.delete-card')) {
      e.preventDefault();
      return false;
    }
    
    this.draggedCardElement = cardElement;
    this.draggedCard = this.dom.getCard(this.draggedCardElement.dataset.cardId);
    
    if (!this.draggedCard) return;
    
    const startColumnElement = this.draggedCardElement.closest('.cards');
    this.dragStartColumn = startColumnElement.dataset.columnId;
    const cards = Array.from(startColumnElement.querySelectorAll('.card'));
    this.dragStartIndex = cards.indexOf(this.draggedCardElement);
    
    e.dataTransfer.setData('text/plain', this.draggedCard.id);
    this.draggedCardElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    this.isDragging = true;
    
    const dragOffsetX = parseInt(this.draggedCardElement.dataset.dragOffsetX) || 0;
    const dragOffsetY = parseInt(this.draggedCardElement.dataset.dragOffsetY) || 0;
    
    const dragImage = this.draggedCardElement.cloneNode(true);
    dragImage.style.position = 'fixed';
    dragImage.style.left = '-1000px';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.7';
    dragImage.style.transform = 'rotate(3deg)';
    dragImage.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, dragOffsetX, dragOffsetY);
    
    setTimeout(() => {
      if (dragImage.parentNode) {
        dragImage.parentNode.removeChild(dragImage);
      }
    }, 0);
    
    document.body.style.cursor = 'grabbing';
  }

  onDragOver(e) {
    e.preventDefault();
    
    if (!this.isDragging) return;
    
    e.dataTransfer.dropEffect = 'move';
    
    const newDropTarget = this.findDropTarget(e.clientX, e.clientY);
    
    if (this.dropTarget !== newDropTarget) {
      this.dropTarget = newDropTarget;
      this.updateDropSpace();
    }
    
    return false;
  }

  findDropTarget(clientX, clientY) {
    const elements = document.elementsFromPoint(clientX, clientY);
    
    for (const element of elements) {
      if (element === this.draggedCardElement || 
          element === this.dropSpace) {
        continue;
      }
      
      if (element.classList.contains('card')) {
        const rect = element.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        const isBefore = relativeY < rect.height / 2;
        
        return {
          element: element,
          position: isBefore ? 'before' : 'after',
          type: 'card'
        };
      }
      else if (element.classList.contains('cards')) {
        const cards = Array.from(element.querySelectorAll('.card:not(.dragging)'));
        
        if (cards.length === 0) {
          return {
            element: element,
            position: 'inside',
            type: 'column'
          };
        } else {
          let closestCard = null;
          let closestDistance = Infinity;
          let closestPosition = 'after';
          
          cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(clientY - cardCenterY);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCard = card;
              closestPosition = clientY < cardCenterY ? 'before' : 'after';
            }
          });
          
          if (closestCard) {
            return {
              element: closestCard,
              position: closestPosition,
              type: 'card'
            };
          }
        }
      }
    }
    
    return null;
  }

  updateDropSpace() {
    // Удаляем существующий drop-space
    if (this.dropSpace && this.dropSpace.parentNode) {
      this.dropSpace.parentNode.removeChild(this.dropSpace);
      this.dropSpace = null;
    }
    
    if (!this.dropTarget || !this.draggedCardElement) return;
    
    // Создаем новый drop-space
    const draggedCardHeight = this.draggedCardElement.offsetHeight || 70;
    this.dropSpace = document.createElement('div');
    this.dropSpace.className = 'drop-space';
    this.dropSpace.style.height = `${draggedCardHeight}px`;
    this.dropSpace.style.marginBottom = '10px';
    this.dropSpace.style.borderRadius = '8px';
    this.dropSpace.style.backgroundColor = 'rgba(0, 121, 191, 0.08)';
    this.dropSpace.style.transition = 'none'; // Убираем анимацию чтобы не было прыжков
    
    // Вставляем в правильное место
    if (this.dropTarget.type === 'card') {
      if (this.dropTarget.position === 'before') {
        this.dropTarget.element.parentNode.insertBefore(this.dropSpace, this.dropTarget.element);
      } else {
        if (this.dropTarget.element.nextSibling) {
          this.dropTarget.element.parentNode.insertBefore(this.dropSpace, this.dropTarget.element.nextSibling);
        } else {
          this.dropTarget.element.parentNode.appendChild(this.dropSpace);
        }
      }
    } else if (this.dropTarget.type === 'column' && this.dropTarget.position === 'inside') {
      this.dropTarget.element.insertBefore(this.dropSpace, this.dropTarget.element.firstChild);
    }
  }

  onDragEnter(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
      this.dropTarget = null;
      this.removeDropSpace();
    }
  }

  onDrop(e) {
    e.preventDefault();
    
    if (!this.isDragging || !this.draggedCard) return;
    
    let targetColumn = null;
    let insertIndex = null;
    
    if (this.dropTarget) {
      if (this.dropTarget.type === 'card') {
        const cardElement = this.dropTarget.element;
        const columnElement = cardElement.closest('.cards');
        targetColumn = columnElement.dataset.columnId;
        
        const cards = Array.from(columnElement.querySelectorAll('.card:not(.dragging)'));
        const targetIndex = cards.indexOf(this.dropTarget.element);
        
        if (this.dropTarget.position === 'before') {
          insertIndex = targetIndex;
        } else {
          insertIndex = targetIndex + 1;
        }
      } 
      else if (this.dropTarget.type === 'column') {
        targetColumn = this.dropTarget.element.dataset.columnId;
        const cards = Array.from(this.dropTarget.element.querySelectorAll('.card:not(.dragging)'));
        
        if (this.dropTarget.position === 'inside') {
          insertIndex = 0;
        } else {
          insertIndex = cards.length;
        }
      }
    }
    
    this.removeDropSpace();
    
    if (targetColumn !== null) {
      this.dom.moveCard(
        this.draggedCard.id,
        this.dragStartColumn,
        targetColumn,
        insertIndex
      );
    }
    
    this.cleanupAfterDrop();
    return false;
  }

  onDragEnd(e) {
    this.cleanupAfterDrop();
  }

  removeDropSpace() {
    if (this.dropSpace && this.dropSpace.parentNode) {
      this.dropSpace.parentNode.removeChild(this.dropSpace);
      this.dropSpace = null;
    }
  }

  cleanupAfterDrop() {
    this.removeDropSpace();
    
    if (this.draggedCardElement) {
      this.draggedCardElement.classList.remove('dragging');
      this.draggedCardElement.draggable = false;
    }
    
    document.body.style.cursor = '';
    
    this.draggedCard = null;
    this.draggedCardElement = null;
    this.dragStartColumn = null;
    this.dragStartIndex = null;
    this.dropTarget = null;
    this.isDragging = false;
  }
}