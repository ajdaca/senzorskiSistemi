let chart = null;

$(document).ready(function () {
    const csvUrl = 'https://ajdaca.github.io/senzorskiSistemi/senzori1.csv';

    // Automatsko učitavanje CSV sa GitHub Pages
    $.get(csvUrl, function(data) {
        dataToArrays(data);
    }, 'text');

    // Upload lokalnog CSV fajla
    $('#csvFile').on('change', function(evt) {
        const file = evt.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            dataToArrays(e.target.result);
        };
    });
});

function dataToArrays(data) {
    const parsedData = Papa.parse(data, { header: false });
    createChart(parsedData);
}

function createChart(parsedData) {
    const dataArray = parsedData.data;
    const dataMatrix = [];
    const headingArray = [];

    // Heading i dataMatrix
    for (let i = 0; i < dataArray[0].length; i++) {
        dataMatrix[i] = [];
        headingArray.push({
            title: dataArray[0][i],
            unit: dataArray[1][i] || ''
        });
    }

    for (let i = 0; i < dataArray.length; i++) {
        for (let j = 0; j < dataArray[i].length; j++) {
            dataMatrix[j][i] = dataArray[i][j] || null;
        }
    }

    // Uklanjanje kolone "Comment"
    const commentIndex = headingArray.findIndex(el => el.title === 'Comment');
    if (commentIndex !== -1) {
        dataMatrix.splice(commentIndex, 1);
        headingArray.splice(commentIndex, 1);
    }

    // Prikaz CSV u tabeli
    let html = '<table class="table"><tbody>';
    parsedData.data.forEach(row => {
        if (row.some(el => el !== null)) {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell !== null ? cell : ''}</td>`;
            });
            html += '</tr>';
        }
    });
    html += '</tbody></table>';
    $('#parsedData').html(html);

    // Labels i datasets
    const labels = dataMatrix[0].slice(3); // ukloni prva 3 reda
    const datasets = [];

    for (let i = 1; i < dataMatrix.length; i++) {
        const label = dataMatrix[i][0];
        const datasetData = dataMatrix[i].slice(3);

        datasets.push({
            label: label,
            data: datasetData,
            borderColor: '#' + getColor(),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,                // nema osenčenu površinu
            backgroundColor: 'transparent'
        });
    }

    // Kreiranje Chart.js linijskog grafa
    const ctx = document.getElementById('myChart').getContext('2d');
    if (chart) chart.destroy(); // uništi stari chart
    chart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            title: {
                display: true,
                text: ['Display of measurement results'],
                fontSize: 23
            },
            legend: {
                position: 'bottom',
                labels: { fontColor: 'black' }
            },
            tooltips: {
                intersect: false,
                callbacks: {
                    title: t => headingArray[0].title + ": " + t[0].label + " " + headingArray[0].unit,
                    label: t => t.yLabel + " " + headingArray[t.datasetIndex + 1].unit
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function getColor() {
    const colors = ['FF0000','FF4500','C71585','FF8C00','FF00FF','1E90FF','0000FF','D2691E','CD5C5C','6A5ACD','32CD32','008080'];
    return colors[Math.floor(Math.random() * colors.length)];
}
