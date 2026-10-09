(function () {
    const cells = Array.from(document.querySelectorAll('#board .cell'));
    const okBtn = document.getElementById('okBtn');
    const dialog = document.getElementById('resultDialog');
    const icon = document.getElementById('dialogIcon');
    const title = document.getElementById('dialogTitle');
    const text = document.getElementById('dialogText');

    cells[0].focus();

    cells.forEach((cell, i) => {
        // клик по клетке — выделяем содержимое, чтобы буква легко заменилась
        cell.addEventListener('click', () => cell.select());

        cell.addEventListener('input', () => {
            // оставляем только одну букву
            cell.value = cell.value.replace(/[^A-Za-zА-Яа-яЁё]/g, '').slice(-1).toUpperCase();
            if (cell.value && i < cells.length - 1) {
                cells[i + 1].focus();
            }
        });

        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !cell.value && i > 0) {
                cells[i - 1].focus();
                cells[i - 1].value = '';
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' && i > 0) {
                cells[i - 1].focus();
            } else if (e.key === 'ArrowRight' && i < cells.length - 1) {
                cells[i + 1].focus();
            } else if (e.key === 'Enter') {
                check();
            }
        });
    });

    okBtn.addEventListener('click', check);

    async function check() {
        const emptyCells = cells.filter((c) => !c.value);
        if (emptyCells.length > 0) {
            emptyCells.forEach((c) => {
                c.classList.add('shake');
                setTimeout(() => c.classList.remove('shake'), 400);
            });
            emptyCells[0].focus();
            return;
        }

        const guess = cells.map((c) => c.value).join('');

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guess: guess })
            });
            const data = await response.json();

            if (data.expired) {
                showDialog('lose', '⏳', 'Сессия истекла', 'Начни игру заново.');
            } else if (data.correct) {
                showDialog('win', '🎉', 'Молодец!', 'Ты угадал слово: ' + data.word);
            } else {
                showDialog('lose', '😕', 'Не угадал', 'Это было слово: ' + data.word);
            }
        } catch (err) {
            showDialog('lose', '⚠️', 'Ошибка', 'Не удалось связаться с сервером.');
        }
    }

    function showDialog(kind, emoji, heading, message) {
        dialog.classList.remove('win', 'lose');
        dialog.classList.add(kind);
        icon.textContent = emoji;
        title.textContent = heading;
        text.textContent = message;
        dialog.showModal();
    }
})();
