async function getRandomName() {
    const maleNames = [
        'Александр',
        'Максим',
        'Иван',
        'Дмитрий',
        'Никита',
        'Артем',
        'Михаил',
        'Денис',
        'Владимир',
        'Сергей',
    ];

    const femaleNames = [
        'Анна',
        'Мария',
        'Екатерина',
        'Ольга',
        'Ирина',
        'Алина',
        'Наталья',
        'Татьяна',
        'Ксения',
        'Елена',
    ];

    // Случайно выбираем пол
    const isMale = Math.random() < 0.5;

    // Выбираем подходящий список имён
    const list = isMale ? maleNames : femaleNames;

    // Случайное имя из списка
    const name = list[Math.floor(Math.random() * list.length)];

    // Возвращаем имя и пол
    return {
        name: name,
        gender: isMale ? 'male' : 'female'
    };
}

module.exports = getRandomName;