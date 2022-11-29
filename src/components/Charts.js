import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement, Filler } from "chart.js";
import { Component } from "react";
ChartJS.register(
    Title, Tooltip, LineElement, Legend,
    CategoryScale, LinearScale, PointElement, Filler
)

const borderColor = "#777";
const backgroundColor = "rgba(255,243,92,0.78)";
const pointColor = "#777";
const defaults = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    tension: 0.4,
    fill: true,
    pointBorderColor: pointColor,
}

const options = {
    plugins: {
        legend: {
            display: false,
        },
    }
}

class Charts extends Component {

    render() {
        return (
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <code>{this.props.token0 ? this.props.token0 : "-"}</code>
                    <Line
                        data={{
                            labels: this.props.dates,
                            datasets: [
                                {
                                    label: this.props.token0,
                                    data: this.props.token0prices,
                                    ...defaults,
                                }
                            ]
                        }}
                        options={options}
                    >
                    </Line>
                </div>
                <div>
                    <code>{this.props.token0 && this.props.token1 ? this.props.token0 + "-" + this.props.token1 : "-"}</code>
                    <Line
                        data={{
                            labels: this.props.dates,
                            datasets: [
                                {
                                    label: this.props.token0 + " " + this.props.token1,
                                    data: this.props.token01prices,
                                    ...defaults,
                                }
                            ]
                        }}
                        options={options}
                    >
                    </Line>
                </div>
                <div>
                    <code>{this.props.token1 ? this.props.token1 : "-"}</code>
                    <Line
                        data={{
                            labels: this.props.dates,
                            datasets: [
                                {
                                    label: this.props.token1,
                                    data: this.props.token1prices,
                                    backgroundColor: backgroundColor,
                                    ...defaults,
                                }
                            ]
                        }}
                        options={options}
                    >
                    </Line>
                </div>
            </div>
        )
    }
}

export default Charts;