import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement, Filler } from "chart.js";
import { Component } from "react";
ChartJS.register(
    Title, Tooltip, LineElement, Legend,
    CategoryScale, LinearScale, PointElement, Filler
)

const color = "red";

class Charts extends Component {

    render() {
        return (
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Line
                        data={{
                            labels: ["Jan", "Feb", "March"],
                            datasets: [
                                {
                                    label: "First Dataset",
                                    data: this.props.token0prices,
                                    backgroundColor: "yellow",
                                    borderColor: color,
                                    tension: 0.4,
                                    fill: true,
                                    pointStyle: 'star',
                                    pointBorderColor: 'blue'
                                }
                            ]
                        }}
                    >
                    </Line>
                </div>
                <div>
                    <Line
                        data={{
                            labels: ["Jan", "Feb", "March"],
                            datasets: [
                                {
                                    label: "First Dataset",
                                    data: this.props.token01prices,
                                    backgroundColor: "yellow",
                                    borderColor: color,
                                    tension: 0.4,
                                    fill: true,
                                    pointStyle: 'star',
                                    pointBorderColor: 'blue'
                                }
                            ]
                        }}
                    >
                    </Line>
                </div>
                <div>
                    <Line
                        data={{
                            labels: ["Jan", "Feb", "March"],
                            datasets: [
                                {
                                    label: "First Dataset",
                                    data: this.props.token1prices,
                                    backgroundColor: "yellow",
                                    borderColor: color,
                                    tension: 0.4,
                                    fill: true,
                                    pointStyle: 'star',
                                    pointBorderColor: 'blue'
                                }
                            ]
                        }}
                    >
                    </Line>
                </div>
            </div>
        )
    }
}

export default Charts;