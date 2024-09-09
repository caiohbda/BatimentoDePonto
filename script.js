const STANDARD_WORK_HOURS = 8;
const OVERTIME_ALERT_THRESHOLD = 20;
let totalOvertimeHours = 0;

let currentDate = null;
let entryTime = null;
let lunchOutTime = null;
let lunchInTime = null;
let exitTime = null;
let isLunchOutRegistered = false;

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function calculateHours(start, end) {
    if (!start || !end) return 0;

    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0);

    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0);

    return (endDate - startDate) / (1000 * 60 * 60);
}

function registerEntry() {
    currentDate = document.getElementById('date').value;
    entryTime = document.getElementById('time').value;

    if (!currentDate || !entryTime) {
        alert('Por favor, insira a data e a hora de entrada.');
        return;
    }

    const storedData = JSON.parse(localStorage.getItem('pontoData')) || {};
    if (!storedData[currentDate]) {
        storedData[currentDate] = { entryTime };
        localStorage.setItem('pontoData', JSON.stringify(storedData));
        alert(`Entrada registrada: ${entryTime}`);
    } else {
        alert('Já foi registrada uma entrada para esta data.');
    }
}

function registerLunchOut() {
    if (!currentDate) {
        alert('Por favor, registre a entrada antes de registrar a saída para o almoço.');
        return;
    }

    lunchOutTime = document.getElementById('time').value;

    if (!lunchOutTime) {
        alert('Por favor, insira a hora de saída para o almoço.');
        return;
    }

    const storedData = JSON.parse(localStorage.getItem('pontoData'));
    if (storedData[currentDate]) {
        storedData[currentDate].lunchOutTime = lunchOutTime;
        isLunchOutRegistered = true;
        localStorage.setItem('pontoData', JSON.stringify(storedData));
        alert(`Saída para o almoço registrada: ${lunchOutTime}`);
    } else {
        alert('Entrada não registrada para esta data.');
    }
}

function registerLunchIn() {
    if (!currentDate || !isLunchOutRegistered) {
        alert('Por favor, registre a saída para o almoço antes de registrar a entrada após o almoço.');
        return;
    }

    lunchInTime = document.getElementById('time').value;

    if (!lunchInTime) {
        alert('Por favor, insira a hora de entrada após o almoço.');
        return;
    }

    const storedData = JSON.parse(localStorage.getItem('pontoData'));
    if (storedData[currentDate]) {
        storedData[currentDate].lunchInTime = lunchInTime;
        localStorage.setItem('pontoData', JSON.stringify(storedData));
        alert(`Entrada após o almoço registrada: ${lunchInTime}`);
    } else {
        alert('Entrada não registrada para esta data.');
    }
}

function registerExit() {
    if (!currentDate || !isLunchOutRegistered) {
        alert('Por favor, registre todos os horários antes de registrar a saída final.');
        return;
    }

    exitTime = document.getElementById('time').value;

    if (!exitTime) {
        alert('Por favor, insira a hora de saída final.');
        return;
    }

    const storedData = JSON.parse(localStorage.getItem('pontoData'));
    if (storedData[currentDate]) {
        storedData[currentDate].exitTime = exitTime;

        const { entryTime, lunchOutTime, lunchInTime } = storedData[currentDate];
        const morningWork = calculateHours(entryTime, lunchOutTime);
        const afternoonWork = calculateHours(lunchInTime, exitTime);
        const totalWork = morningWork + afternoonWork;

        const overtimeHours = Math.max(0, totalWork - STANDARD_WORK_HOURS);
        totalOvertimeHours += overtimeHours;

        storedData[currentDate].overtimeHours = overtimeHours;
        localStorage.setItem('pontoData', JSON.stringify(storedData));

        alert(`Horas extras acumuladas: ${totalOvertimeHours.toFixed(2)} horas`);

        if (totalOvertimeHours >= OVERTIME_ALERT_THRESHOLD) {
            alert('Você atingiu ou excedeu 20 horas extras!');
        }

        const remainingOvertimeHours = OVERTIME_ALERT_THRESHOLD - totalOvertimeHours;
        const message = remainingOvertimeHours <= 0 ? 
            'Você já atingiu o limite de horas extras!' :
            `Horas extras restantes para atingir 20 horas: ${remainingOvertimeHours.toFixed(2)} horas.`;

        document.getElementById('message').innerText = message;

        const formattedDate = formatDate(currentDate);
        document.getElementById('record-date').innerText = `Data do Registro: ${formattedDate}`;

        currentDate = null;
        entryTime = null;
        lunchOutTime = null;
        lunchInTime = null;
        exitTime = null;
        isLunchOutRegistered = false;

        document.getElementById('date').value = '';
        document.getElementById('time').value = '';
    } else {
        alert('Entrada não registrada para esta data.');
    }
}

function showHistory() {
    const storedData = JSON.parse(localStorage.getItem('pontoData')) || {};
    let historyContent = '<h2>Histórico de Batidas</h2><ul>';

    for (const date in storedData) {
        const { entryTime, lunchOutTime, lunchInTime, exitTime, overtimeHours } = storedData[date];
        historyContent += `<li>
            <strong>Data:</strong> ${formatDate(date)}<br>
            <strong>Entrada:</strong> ${entryTime || 'Não registrada'}<br>
            <strong>Saída para Almoço:</strong> ${lunchOutTime || 'Não registrada'}<br>
            <strong>Entrada Após Almoço:</strong> ${lunchInTime || 'Não registrada'}<br>
            <strong>Saída Final:</strong> ${exitTime || 'Não registrada'}<br>
            <strong>Horas Extras:</strong> ${overtimeHours || 0} horas
        </li>`;
    }

    historyContent += '</ul>';
    document.getElementById('history').innerHTML = historyContent;
    document.getElementById('history').style.display = 'block';
    document.getElementById('show-history-btn').style.display = 'none';
    document.getElementById('hide-history-btn').style.display = 'inline';
}

function hideHistory() {
    document.getElementById('history').style.display = 'none';
    document.getElementById('show-history-btn').style.display = 'inline';
    document.getElementById('hide-history-btn').style.display = 'none';
}

document.getElementById('register-entry-btn').addEventListener('click', registerEntry);
document.getElementById('register-lunch-out-btn').addEventListener('click', registerLunchOut);
document.getElementById('register-lunch-in-btn').addEventListener('click', registerLunchIn);
document.getElementById('register-exit-btn').addEventListener('click', registerExit);
document.getElementById('show-history-btn').addEventListener('click', showHistory);
document.getElementById('hide-history-btn').addEventListener('click', hideHistory);
