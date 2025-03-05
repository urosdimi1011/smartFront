<template>
    <div class="text-center">
        <DoughnutChart :chart-data="chartData" :chart-options="chartOptions" />
        <p class="temperature-text">
            Temperatura: {{ props.temperature }} °C
        </p>
    </div>
</template>
<script setup>
import {defineProps} from 'vue';
import { DoughnutChart } from 'vue-chart-3';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    DoughnutController
} from 'chart.js';

const props = defineProps({
    temperature : {
        type : Number,
        required : false,
        default : 25
    }
})

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

const chartData = {
    labels: ['Temperature', 'Remaining'],
    datasets: [
        {
            data: [props.temperature, 100 - props.temperature], // 25°C temperatura, ostatak do 100%
            backgroundColor: ['#FF6384', '#E5E5E5'], // Boje za ispunu
            hoverBackgroundColor: ['#FF6384', '#E5E5E5'],
            borderWidth: 0,
        },
    ],
};

const chartOptions = {
    responsive: true,
    cutout: '70%', // Pravi "prsten"
    rotation: -90, // Rotira grafikon da počinje od vrha
    circumference: 180, // Prikazuje samo polovinu kruga
    plugins: {
        legend: {
            display: false, // Sakriva legendu
        },
        tooltip: {
            callbacks: {
                label: function (tooltipItem) {
                    return `${tooltipItem.raw} °C`; // Prikazuje temperaturu u tooltipu
                },
            },
        },
    },
};
</script>
<style scoped>
    .text-center{
        text-align: center;
    }
    .temperature-text {
        font-size: 24px; 
        margin-top: 10px; 
        color: #FF6384;
    }
</style>