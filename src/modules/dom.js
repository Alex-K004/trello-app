export default class DOM {
  constructor(storage, dragDrop) {
    this.storage = storage;
    this.dragDrop = dragDrop;
    this.columnsContainer = null;
    this.columns = this.storage.loadState();
    
    // Находим максимальный ID карточек
    const allCardIds = this.columns.flatMap(col => 
      col.cards.map(card => parseInt(card.id))
    );
    this.nextCardId = allCardIds.length > 0 ? Math.max(...allCardIds) + 1 : 12;
  }

  init() {
    this.columnsContainer = document.querySelector('.columns');
    if (!this.columnsContainer) {
      console.error('Элемент .columns не найден в DOM!');
      return;
    }
    
    this.renderColumns();
    this.attachEventListeners();
  }

  renderColumns() {
    this.columnsContainer.innerHTML = '';
    
    this.columns.forEach(column => {
      const columnElement = this.createColumnElement(column);
      this.columnsContainer.appendChild(columnElement);
    });
  }

  createColumnElement(column) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    columnDiv.dataset.columnId = column.id;
    
    columnDiv.innerHTML = `
      <div class="column-header">
        <h3 class="column-title">${column.title}</h3>
        <span class="column-counter">${column.cards.length}</span>
      </div>
      <div class="cards" data-column-id="${column.id}">
        ${column.cards.map(card => this.createCardElement(card)).join('')}
      </div>
      <div class="add-card-form" style="display: none;">
        <textarea class="add-card-input" placeholder="Введите описание карточки..." rows="3"></textarea>
        <button class="add-card-btn">Добавить карточку</button>
        <button class="cancel-card-btn">Отмена</button>
      </div>
      <div class="add-card-placeholder">
        <i class="fas fa-plus"></i> Добавить карточку
      </div>
    `;
    
    return columnDiv;
  }

  createCardElement(card) {
    return `
      <div class="card" draggable="true" data-card-id="${card.id}">
        <div class="card-content">${this.escapeHtml(card.content)}</div>
        <span class="delete-card" data-card-id="${card.id}">
          <i class="fas fa-times"></i>
        </span>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  attachEventListeners() {
    // Обработчики для добавления карточек
    document.querySelectorAll('.add-card-placeholder').forEach(placeholder => {
      placeholder.addEventListener('click', (e) => this.showAddCardForm(e));
    });

    // Используем делегирование событий для всех действий
    document.addEventListener('click', (e) => {
      // Обработка удаления карточки
      const deleteBtn = e.target.closest('.delete-card');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.deleteCard(deleteBtn.dataset.cardId);
        return;
      }
      
      // Обработка иконки внутри кнопки удаления
      const deleteIcon = e.target.closest('.delete-card i');
      if (deleteIcon) {
        e.preventDefault();
        e.stopPropagation();
        const deleteBtn = deleteIcon.closest('.delete-card');
        this.deleteCard(deleteBtn.dataset.cardId);
        return;
      }
      
      // Обработка кнопок добавления карточек
      if (e.target.classList.contains('add-card-btn')) {
        this.addCard(e);
        return;
      }
      
      // Обработка кнопок отмены
      if (e.target.classList.contains('cancel-card-btn')) {
        this.hideAddCardForm(e);
        return;
      }
    });

    // Инициализация drag and drop
    if (this.dragDrop && typeof this.dragDrop.init === 'function') {
      this.dragDrop.init(this);
    }
  }

  showAddCardForm(e) {
    const columnElement = e.target.closest('.column');
    const placeholder = columnElement.querySelector('.add-card-placeholder');
    const form = columnElement.querySelector('.add-card-form');
    
    placeholder.style.display = 'none';
    form.style.display = 'block';
    form.querySelector('.add-card-input').focus();
  }

  hideAddCardForm(e) {
    const columnElement = e.target.closest('.column');
    const placeholder = columnElement.querySelector('.add-card-placeholder');
    const form = columnElement.querySelector('.add-card-form');
    const input = form.querySelector('.add-card-input');
    
    input.value = '';
    form.style.display = 'none';
    placeholder.style.display = 'block';
  }

  addCard(e) {
    const columnElement = e.target.closest('.column');
    const columnId = columnElement.dataset.columnId;
    const input = columnElement.querySelector('.add-card-input');
    const content = input.value.trim();
    
    if (!content) {
      input.focus();
      return;
    }
    
    const newCard = {
      id: (this.nextCardId++).toString(),
      content: content
    };
    
    // Найти колонку и добавить карточку
    const column = this.columns.find(col => col.id === columnId);
    if (column) {
      column.cards.push(newCard);
      this.saveAndRender();
    }
    
    // Сбросить форму
    input.value = '';
    this.hideAddCardForm(e);
  }

  deleteCard(cardId) {
    // Найти и удалить карточку из всех колонок
    this.columns.forEach(column => {
      const index = column.cards.findIndex(card => card.id === cardId);
      if (index > -1) {
        column.cards.splice(index, 1);
      }
    });
    
    this.saveAndRender();
  }

  moveCard(cardId, fromColumnId, toColumnId, insertIndex) {
    let cardToMove = null;
    
    // Найти карточку в исходной колонке
    const fromColumn = this.columns.find(col => col.id === fromColumnId);
    const cardIndex = fromColumn.cards.findIndex(card => card.id === cardId);
    
    if (cardIndex > -1) {
      cardToMove = fromColumn.cards.splice(cardIndex, 1)[0];
    }
    
    if (cardToMove) {
      // Добавить карточку в новую колонку
      const toColumn = this.columns.find(col => col.id === toColumnId);
      
      if (insertIndex !== undefined && insertIndex !== null) {
        toColumn.cards.splice(insertIndex, 0, cardToMove);
      } else {
        toColumn.cards.push(cardToMove);
      }
      
      this.saveAndRender();
    }
  }

  saveAndRender() {
    this.storage.saveState(this.columns);
    this.renderColumns();
    this.attachEventListeners();
  }

  getColumns() {
    return this.columns;
  }

  getCard(cardId) {
    for (const column of this.columns) {
      const card = column.cards.find(card => card.id === cardId);
      if (card) {
        return card;
      }
    }
    return null;
  }
}