import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
    pointBackgroundColor?: string
    pointBorderColor?: string
    pointRadius?: number
    pointHoverRadius?: number
  }[]
}

interface ProgressChartProps {
  type: 'bar' | 'line'
  data: ChartData
  title: string
  height?: number
  className?: string
}

export default function ProgressChart({ 
  type, 
  data, 
  title, 
  height = 300,
  className = '' 
}: ProgressChartProps) {
  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            weight: 500
          },
          padding: 8
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 6,
        radius: 4,
      }
    }
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-purple shadow-soft ${className}`}>
      <h3 className="text-xl font-display text-dark mb-6 text-center">{title}</h3>
      <div style={{ height }}>
        {type === 'bar' ? (
          <Bar data={data} options={options} />
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  )
}
