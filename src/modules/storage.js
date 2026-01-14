export default class Storage {
  static STORAGE_KEY = 'trello_board';

  static saveState(columns) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(columns));
    } catch (error) {
      console.error('Ошибка при сохранении в LocalStorage:', error);
    }
  }

  static loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Ошибка при загрузке из LocalStorage:', error);
    }
    
    // Возвращаем начальное состояние по умолчанию
    return [
      {
        id: 'todo',
        title: 'Сделать',
        cards: [
          { id: '1', content: 'Добро пожаловать в Trello!' },
          { id: '2', content: 'Это карточка' },
          { id: '3', content: 'Кликните на карточку, чтобы увидеть что внутри' },
          { id: '4', content: 'Вы можете прикреплять картинки и файлы...' }
        ]
      },
      {
        id: 'progress',
        title: 'В процессе',
        cards: [
          { id: '5', content: 'Пригласите вашу команду на эту доску' },
          { id: '6', content: 'Перетащите людей на карточку' },
          { id: '7', content: 'Используйте цветные метки для организации' },
          { id: '8', content: 'Создавайте столько списков, сколько нужно!' }
        ]
      },
      {
        id: 'done',
        title: 'Готово',
        cards: [
          { id: '9', content: 'Чтобы узнать больше, проверьте руководство' },
          { id: '10', content: 'Используйте столько досок, сколько хотите' },
          { id: '11', content: 'Хотите использовать горячие клавиши? Они есть!' }
        ]
      }
    ];
  }
}