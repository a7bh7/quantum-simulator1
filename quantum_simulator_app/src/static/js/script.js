document.addEventListener("DOMContentLoaded", function() {
    console.log("Quantum Simulator script loading...");

    // --- Slider Value Updates ---
    const sliders = [
        { id: "slit-distance", valueId: "slit-distance-value" },
        { id: "electron-energy", valueId: "electron-energy-value" },
        { id: "observation-intensity", valueId: "observation-intensity-value" },
        { id: "screen-distance", valueId: "screen-distance-value" },
        { id: "medium-temperature", valueId: "medium-temperature-value" },
    ];

    sliders.forEach(sliderInfo => {
        const sliderElement = document.getElementById(sliderInfo.id);
        const valueElement = document.getElementById(sliderInfo.valueId);

        if (sliderElement && valueElement) {
            valueElement.textContent = sliderElement.value;
            sliderElement.addEventListener("input", function() {
                valueElement.textContent = this.value;
            });
        } else {
            console.error(`Slider or value element not found for: ${sliderInfo.id}`);
        }
    });

    // --- Plotly Chart Initialization ---
    const probabilityChartDiv = document.getElementById("probability-chart");
    const interferencePatternDiv = document.getElementById("interference-pattern");
    const resultsOutputDiv = document.getElementById("results-output"); // Get the container for fade-in

    // Function to add fade-in animation class
    function triggerFadeIn(element) {
        if (element) {
            element.classList.remove("fade-in");
            // Trigger reflow to restart animation
            void element.offsetWidth;
            element.classList.add("fade-in");
        }
    }

    // Add CSS for fade-in animation
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .fade-in {
            animation: fadeInAnimation 0.5s ease-in forwards;
            opacity: 0;
        }
        @keyframes fadeInAnimation {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);


    function createProbabilityChart(waveProb = 0.5, particleProb = 0.5) {
        if (!probabilityChartDiv) {
            console.error("Probability chart div not found!");
            return;
        }
        const data = [{
            x: ["احتمال موجي", "احتمال جسيمي"],
            y: [waveProb, particleProb],
            type: "bar",
            marker: {
                color: ["#00ccff", "#39ff14"] // neon-blue, neon-green
            }
        }];
        const layout = {
            yaxis: { range: [0, 1], title: { text: "الاحتمالية", font: { color: "#9ca3af" } }, gridcolor: "#374151", tickfont: { color: "#9ca3af" } },
            xaxis: { tickfont: { color: "#9ca3af" } },
            margin: { t: 20, b: 40, l: 50, r: 20 },
            font: { family: "inherit", size: 12, color: "#d1d5db" },
            paper_bgcolor: "#1f2937", // card-bg
            plot_bgcolor: "#1f2937", // card-bg
            transition: { duration: 500, easing: "cubic-in-out" } // Add transition for updates
        };
        Plotly.newPlot(probabilityChartDiv, data, layout, {responsive: true, displayModeBar: false});
    }

    function createInterferencePattern(xData = [], yData = []) {
        if (!interferencePatternDiv) {
            console.error("Interference pattern div not found!");
            return;
        }
        if (xData.length === 0) {
             interferencePatternDiv.innerHTML = 
                `<div class="flex items-center justify-center h-full">
                     <p class="text-secondary-text text-center">اضغط "توقع السلوك" لعرض النمط.</p>
                 </div>`;
             return;
        }

        const data = [{
            x: xData,
            y: yData,
            type: "scatter",
            mode: "lines",
            line: { color: "#6d28d9", width: 2.5 } // accent-purple
        }];
        const layout = {
            xaxis: { title: { text: "الموضع على الشاشة", font: { color: "#9ca3af" } }, gridcolor: "#374151", tickfont: { color: "#9ca3af" } },
            yaxis: { title: { text: "الكثافة النسبية", font: { color: "#9ca3af" } }, gridcolor: "#374151", tickfont: { color: "#9ca3af" } },
            margin: { t: 20, b: 50, l: 60, r: 20 },
            font: { family: "inherit", size: 12, color: "#d1d5db" },
            paper_bgcolor: "#1f2937", // card-bg
            plot_bgcolor: "#1f2937", // card-bg
            transition: { duration: 500, easing: "cubic-in-out" } // Add transition for updates
        };
        Plotly.newPlot(interferencePatternDiv, data, layout, {responsive: true, displayModeBar: false});
    }

    // Initialize charts
    if (probabilityChartDiv) createProbabilityChart();
    if (interferencePatternDiv) createInterferencePattern();

    // --- Form Submission Handler ---
    const form = document.getElementById("simulation-form");
    const predictButton = form ? form.querySelector("button[type=\"submit\"]") : null;
    const predictedBehaviorSpan = document.getElementById("predicted-behavior");

    if (form && predictButton && predictedBehaviorSpan) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            console.log("Form submitted. Preparing data...");

            predictButton.disabled = true;
            predictButton.textContent = "جاري التوقع...";
            predictedBehaviorSpan.textContent = "...";
            if(resultsOutputDiv) resultsOutputDiv.classList.remove("fade-in"); // Reset animation

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = parseFloat(value);
            });

            console.log("Sending data to backend:", data);

            try {
                const response = await fetch("/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
                }

                const result = await response.json();
                console.log("Received prediction:", result);

                if (typeof result.predicted_behavior === "undefined" ||
                    typeof result.wave_probability === "undefined" ||
                    typeof result.particle_probability === "undefined" ||
                    !Array.isArray(result.pattern_x) ||
                    !Array.isArray(result.pattern_y)) {
                    throw new Error("Invalid data structure received from server.");
                }

                // Update UI with results
                predictedBehaviorSpan.textContent = result.predicted_behavior === "Wave" ? "موجي" : "جسيمي";
                createProbabilityChart(result.wave_probability, result.particle_probability);
                createInterferencePattern(result.pattern_x, result.pattern_y);

                // Trigger fade-in animation for the results container
                triggerFadeIn(resultsOutputDiv);

            } catch (error) {
                console.error("Error during prediction request:", error);
                predictedBehaviorSpan.textContent = "خطأ في التوقع";
                createProbabilityChart(0, 0);
                createInterferencePattern([], []);
                triggerFadeIn(resultsOutputDiv); // Also animate error state
            } finally {
                predictButton.disabled = false;
                predictButton.textContent = "توقع السلوك";
            }
        });
    } else {
        console.error("Simulation form, button, or prediction span not found!");
    }

    console.log("Quantum Simulator script loaded successfully and event listeners attached.");
});

