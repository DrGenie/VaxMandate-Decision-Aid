/****************************************************************************
 * SCRIPT.JS
 * Vaccine Mandate Policy Simulator
 * - Dynamic content for tabs, scenario calculation, charts, and PDF export.
 ****************************************************************************/

document.addEventListener("DOMContentLoaded", function() {
  const tabButtons = document.querySelectorAll(".tablink");
  tabButtons.forEach(button => {
    button.addEventListener("click", function() {
      openTab(this.getAttribute("data-tab"), this);
    });
  });
  // Set default tab
  openTab("introTab", document.querySelector(".tablink"));

  // Initialize default country and scenario selection (if needed)
  document.getElementById("country_select").value = "Australia";
  document.getElementById("framing_select").value = "pooled";
});

/** Tab switching logic (and auto-render charts on tab open) */
function openTab(tabId, btn) {
  const tabs = document.querySelectorAll(".tabcontent");
  tabs.forEach(tab => tab.style.display = "none");
  const tabButtons = document.querySelectorAll(".tablink");
  tabButtons.forEach(button => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
  });
  document.getElementById(tabId).style.display = "block";
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");

  if (tabId === 'wtpTab') renderWTPChart();
  if (tabId === 'costsTab') renderCostsBenefits();
  if (tabId === 'probTab') renderProbChart();
}

/** Slider display update for Lives Saved */
function updateLivesDisplay(val) {
  document.getElementById("livesLabel").textContent = val;
}

/***************************************************************************
 * DCE Coefficient Sets for Each Country & Scenario
 ***************************************************************************/
const coefficientSets = {
  "Australia_pooled": {
    ASC_mean: 0.3785458, ASC_optout: 1.067346,
    scope2: -0.094717, exemption2: -0.052939, exemption3: -0.1479027,
    coverage2: 0.0929465, coverage3: 0.0920977, lives: 0.0445604
  },
  "Australia_mild": {
    ASC_mean: 0.3510644, ASC_optout: 0.9855033,
    scope2: -0.1689361, exemption2: -0.0376554, exemption3: -0.1753159,
    coverage2: 0.1245323, coverage3: 0.0662936, lives: 0.0412682
  },
  "Australia_severe": {
    ASC_mean: 0.4071363, ASC_optout: 1.154312,
    scope2: -0.0204815, exemption2: -0.0681409, exemption3: -0.1219056,
    coverage2: 0.0610344, coverage3: 0.116988, lives: 0.0480637
  },
  "France_pooled": {
    ASC_mean: 0.4762531, ASC_optout: 0.890991,
    scope2: -0.1997912, exemption2: -0.1602495, exemption3: -0.1598304,
    coverage2: 0.1042234, coverage3: 0.1853611, lives: 0.0354086
  },
  "France_mild": {
    ASC_mean: 0.475491, ASC_optout: 0.8976869,
    scope2: -0.3370007, exemption2: -0.1804065, exemption3: -0.0801147,
    coverage2: 0.0828582, coverage3: 0.1469198, lives: 0.0356382
  },
  "France_severe": {
    ASC_mean: 0.4688305, ASC_optout: 0.9124775,
    scope2: -0.0921159, exemption2: -0.153538, exemption3: -0.2389202,
    coverage2: 0.1252384, coverage3: 0.2183836, lives: 0.0365768
  },
  "Italy_pooled": {
    ASC_mean: 0.4706899, ASC_optout: 1.035048,
    scope2: -0.0387768, exemption2: -0.0714253, exemption3: -0.2632533,
    coverage2: 0.2353087, coverage3: 0.1710044, lives: 0.0282736
  },
  "Italy_mild": {
    ASC_mean: 0.3779783, ASC_optout: 0.8981869,
    scope2: -0.1269707, exemption2: -0.0684358, exemption3: -0.2981549,
    coverage2: 0.1762131, coverage3: 0.092999, lives: 0.0254054
  },
  "Italy_severe": {
    ASC_mean: 0.5630024, ASC_optout: 1.17989,
    scope2: 0.0488642, exemption2: -0.0745568, exemption3: -0.2319571,
    coverage2: 0.2970621, coverage3: 0.2517552, lives: 0.0313944
  }
};

/***************************************************************************
 * WTS Data for Each Country & Scenario (WTS = -coef_attribute / coef_lives)
 * Includes standard errors (se) and p-values for each attribute.
 ***************************************************************************/
const wtsDataSets = {
  "Australia_pooled": {
    scope2: { wts: 2.125585, se: 0.9888284, p: 0.032 },
    exemption2: { wts: 1.188027, se: 1.224106, p: 0.332 },
    exemption3: { wts: 3.319147, se: 1.342509, p: 0.013 },
    coverage2: { wts: -2.085852, se: 1.230878, p: 0.090 },
    coverage3: { wts: -2.066804, se: 1.263054, p: 0.102 }
  },
  "Australia_mild": {
    scope2: { wts: 4.093612, se: 1.560018, p: 0.009 },
    exemption2: { wts: 0.912456, se: 1.860301, p: 0.624 },
    exemption3: { wts: 4.248205, se: 2.096250, p: 0.043 },
    coverage2: { wts: -3.017632, se: 1.881638, p: 0.109 },
    coverage3: { wts: -1.606408, se: 1.915567, p: 0.402 }
  },
  "Australia_severe": {
    scope2: { wts: 0.426132, se: 1.269503, p: 0.737 },
    exemption2: { wts: 1.417720, se: 1.615908, p: 0.380 },
    exemption3: { wts: 2.536333, se: 1.728985, p: 0.142 },
    coverage2: { wts: -1.269865, se: 1.617400, p: 0.432 },
    coverage3: { wts: -2.434020, se: 1.671534, p: 0.145 }
  },
  "France_pooled": {
    scope2: { wts: 5.642447, se: 1.479646, p: 0.000 },
    exemption2: { wts: 4.525722, se: 1.801330, p: 0.012 },
    exemption3: { wts: 4.513888, se: 1.893395, p: 0.017 },
    coverage2: { wts: -2.943448, se: 1.721292, p: 0.087 },
    coverage3: { wts: -5.234918, se: 1.824317, p: 0.004 }
  },
  "France_mild": {
    scope2: { wts: 9.456162, se: 2.505022, p: 0.000 },
    exemption2: { wts: 5.062166, se: 2.811776, p: 0.072 },
    exemption3: { wts: 2.247999, se: 2.774792, p: 0.418 },
    coverage2: { wts: -2.324982, se: 2.596713, p: 0.371 },
    coverage3: { wts: -4.122536, se: 2.767933, p: 0.136 }
  },
  "France_severe": {
    scope2: { wts: 2.518423, se: 1.827478, p: 0.168 },
    exemption2: { wts: 4.197686, se: 2.353602, p: 0.075 },
    exemption3: { wts: 6.532012, se: 2.593599, p: 0.012 },
    coverage2: { wts: -3.423982, se: 2.293298, p: 0.135 },
    coverage3: { wts: -5.970547, se: 2.427888, p: 0.014 }
  },
  "Italy_pooled": {
    scope2: { wts: 1.371481, se: 1.607628, p: 0.394 },
    exemption2: { wts: 2.526213, se: 2.028259, p: 0.213 },
    exemption3: { wts: 9.310906, se: 2.473327, p: 0.000 },
    coverage2: { wts: -8.322546, se: 2.113488, p: 0.000 },
    coverage3: { wts: -6.048190, se: 2.165312, p: 0.005 }
  },
  "Italy_mild": {
    scope2: { wts: 4.997780, se: 2.691338, p: 0.063 },
    exemption2: { wts: 2.693748, se: 3.205978, p: 0.401 },
    exemption3: { wts: 11.73587, se: 4.122622, p: 0.004 },
    coverage2: { wts: -6.936041, se: 3.269414, p: 0.034 },
    coverage3: { wts: -3.660596, se: 3.305347, p: 0.268 }
  },
  "Italy_severe": {
    scope2: { wts: -1.556464, se: 1.992159, p: 0.435 },
    exemption2: { wts: 2.374846, se: 2.586814, p: 0.359 },
    exemption3: { wts: 7.388496, se: 3.019664, p: 0.014 },
    coverage2: { wts: -9.462275, se: 2.747486, p: 0.001 },
    coverage3: { wts: -8.019122, se: 2.855633, p: 0.005 }
  }
};

/***************************************************************************
 * Build Scenario from Inputs & Calculate Outputs
 ***************************************************************************/
function buildScenarioFromInputs() {
  const country = document.getElementById("country_select").value;
  const scenarioType = document.getElementById("framing_select").value;
  const lives_val = parseInt(document.getElementById("livesSlider").value, 10);

  // Optional selections
  const scopeRadio = document.querySelector('input[name="scope"]:checked');
  const exemptionRadio = document.querySelector('input[name="exemption"]:checked');
  const coverageRadio = document.querySelector('input[name="coverage"]:checked');

  // Determine booleans for attributes (default reference if not selected)
  const allCheck = scopeRadio ? true : false;                 // true if "All occupations" selected
  const medRelCheck = (exemptionRadio && exemptionRadio.value === "medRel");
  const broadCheck = (exemptionRadio && exemptionRadio.value === "broad");
  const cov70Check = (coverageRadio && coverageRadio.value === "70");
  const cov90Check = (coverageRadio && coverageRadio.value === "90");

  // Gather coefficient set for chosen context
  const coefKey = `${country}_${scenarioType}`;
  const coefs = coefficientSets[coefKey];
  if (!coefs) {
    alert("Coefficients for the selected country/scenario not found.");
    return null;
  }

  // Compute predicted uptake probability
  const prob = computeProbability({
    coefs: coefs,
    allCheck, medRelCheck, broadCheck, cov70Check, cov90Check,
    lives_val
  });
  const uptakePercent = prob * 100;

  // Compute net benefit (cost–benefit calculation)
  const basePopulation = 3000;  // population base for analysis (per 100k)
  const participants = basePopulation * prob;  // number of people complying (out of 100k)
  // Lives saved adjusted by uptake (assuming proportional to compliance)
  const livesSavedTotal = (lives_val / 3000) * (basePopulation * prob);
  // QALY gains per life based on selection
  const QALY_VALUES = { low: 5, moderate: 10, high: 20 };
  const qalyScenario = document.getElementById("qalySelect") ? document.getElementById("qalySelect").value : "moderate";
  const qalyPerLife = QALY_VALUES[qalyScenario];
  const totalQALY = livesSavedTotal * qalyPerLife;
  // Value per QALY (currency-specific)
  const currencySymbol = (country === "Australia") ? "A$" : "€";
  const valuePerQALY = 50000;  // 50k in local currency
  // Cost calculations
  const costPerPerson = 50;  // assume ~50 in local currency per fully vaccinated person (including overhead)
  const fixedCost = (basePopulation / 3000) * 200000;  // e.g., $200,000 per 100k for initial setup
  const totalInterventionCost = fixedCost + costPerPerson * participants;
  // Monetized benefits and net benefit
  const monetizedBenefits = totalQALY * valuePerQALY;
  const netBenefit = monetizedBenefits - totalInterventionCost;

  // Prepare scenario object
  return {
    country, scenarioType, lives_val,
    allCheck, medRelCheck, broadCheck, cov70Check, cov90Check,
    predictedUptake: uptakePercent.toFixed(2),
    netBenefit: `${currencySymbol}${netBenefit.toFixed(2)}`
  };
}

/** Compute uptake probability given scenario booleans and coefficients */
function computeProbability(sc) {
  const c = sc.coefs;
  // Construct attribute dummy variables
  const scope2 = sc.allCheck ? 1 : 0;
  const exemption2 = sc.medRelCheck ? 1 : 0;
  const exemption3 = sc.broadCheck ? 1 : 0;
  const coverage2 = sc.cov70Check ? 1 : 0;
  const coverage3 = sc.cov90Check ? 1 : 0;
  const livesCount = sc.lives_val;
  // Utility of mandate alternative and opt-out
  const U_alt = c.ASC_mean
    + c.scope2 * scope2
    + c.exemption2 * exemption2
    + c.exemption3 * exemption3
    + c.coverage2 * coverage2
    + c.coverage3 * coverage3
    + c.lives * livesCount;
  const U_optout = c.ASC_optout;
  // Probability of choosing mandate (logit)
  return Math.exp(U_alt) / (Math.exp(U_alt) + Math.exp(U_optout));
}

/***************************************************************************
 * Render WTS Chart with Error Bars
 ***************************************************************************/
let wtpChartInstance = null;
function renderWTPChart() {
  const country = document.getElementById("country_select").value;
  const scenarioType = document.getElementById("framing_select").value;
  const key = `${country}_${scenarioType}`;
  const dataSet = wtsDataSets[key];
  if (!dataSet) {
    alert("WTS data not available for this scenario.");
    return;
  }
  const ctx = document.getElementById("wtpChartMain").getContext("2d");
  if (wtpChartInstance) wtpChartInstance.destroy();

  // Prepare data arrays
  const labels = ["All occupations", "Med+religious exc.", "Broad exc.", "70% coverage", "90% coverage"];
  const values = [
    dataSet.scope2.wts, dataSet.exemption2.wts, dataSet.exemption3.wts,
    dataSet.coverage2.wts, dataSet.coverage3.wts
  ];
  const errors = [
    dataSet.scope2.se, dataSet.exemption2.se, dataSet.exemption3.se,
    dataSet.coverage2.se, dataSet.coverage3.se
  ];
  const pVals = [
    dataSet.scope2.p, dataSet.exemption2.p, dataSet.exemption3.p,
    dataSet.coverage2.p, dataSet.coverage3.p
  ];
  const barColors = values.map(v => v >= 0 ? 'rgba(231, 76, 60, 0.6)' : 'rgba(46, 204, 113, 0.6)');
  const borderColors = values.map(v => v >= 0 ? 'rgba(192, 57, 43, 1)' : 'rgba(39, 174, 96, 1)');

  const dataConfig = {
    labels,
    datasets: [{
      label: "WTS (lives per 100k)",
      data: values,
      backgroundColor: barColors,
      borderColor: borderColors,
      borderWidth: 1,
      error: errors,
      pVals: pVals
    }]
  };

  wtpChartInstance = new Chart(ctx, {
    type: 'bar',
    data: dataConfig,
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: false },
        title: { display: true, text: `WTS by Attribute (${country}, ${scenarioType})`, font: { size: 16 } },
        tooltip: {
          callbacks: {
            afterBody: function(context) {
              const i = context[0].dataIndex;
              const ds = context[0].dataset;
              const se = ds.error[i].toFixed(3);
              let p = ds.pVals[i];
              p = (p < 0.001) ? "<0.001" : p.toFixed(3);
              return `SE: ${se}, p-value: ${p}`;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'errorbars',
      afterDraw: chart => {
        const { ctx, scales: { x, y } } = chart;
        chart.getDatasetMeta(0).data.forEach((bar, i) => {
          const error = errors[i];
          if (typeof error === 'number') {
            ctx.save();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            // Error bar line
            const value = values[i];
            const topY = y.getPixelForValue(value + error);
            const bottomY = y.getPixelForValue(value - error);
            const xPos = bar.x;
            ctx.beginPath();
            ctx.moveTo(xPos, topY);
            ctx.lineTo(xPos, bottomY);
            ctx.stroke();
            // Caps
            ctx.beginPath();
            ctx.moveTo(xPos - 5, topY);
            ctx.lineTo(xPos + 5, topY);
            ctx.moveTo(xPos - 5, bottomY);
            ctx.lineTo(xPos + 5, bottomY);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    }]
  });
}

/***************************************************************************
 * Render Predicted Uptake Chart (Doughnut) with Recommendation
 ***************************************************************************/
let uptakeChartInstance = null;
function renderProbChart() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;
  const uptakeVal = parseFloat(scenario.predictedUptake);
  drawUptakeChart(uptakeVal);
  const recommendation = getRecommendation(scenario, uptakeVal);
  document.getElementById("modalResults").innerHTML = `<h4>Calculation Results</h4>
    <p><strong>Predicted Uptake:</strong> ${uptakeVal.toFixed(1)}%</p>
    <p>${recommendation}</p>`;
}

/** Draw the doughnut chart for uptake vs non-uptake */
function drawUptakeChart(uptakeVal) {
  const ctx = document.getElementById("uptakeChart").getContext("2d");
  if (uptakeChartInstance) uptakeChartInstance.destroy();
  uptakeChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Uptake", "Non-uptake"],
      datasets: [{
        data: [uptakeVal, 100 - uptakeVal],
        backgroundColor: ["#27ae60", "#c0392b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Predicted Uptake: ${uptakeVal.toFixed(1)}%`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${context.parsed.toFixed(1)}%`
          }
        }
      }
    }
  });
}

/** Generate recommendation text based on selected attributes and uptake */
function getRecommendation(scenario, uptake) {
  let rec = "Recommendation: ";
  const scenarioKey = `${scenario.country}_${scenario.scenarioType}`;

  // Scope recommendation
  if (scenario.allCheck && uptake < 50) {
    rec += "A mandate covering all occupations may face resistance; consider limiting the mandate to high-risk groups to improve acceptance. ";
  }
  // Exemption recommendations
  if (scenario.broadCheck && uptake < 50) {
    rec += "Broad personal exemptions can undermine the mandate’s effectiveness; tightening exemptions (e.g. to medical only) could increase public support. ";
  } else if (scenario.medRelCheck && uptake < 50) {
    rec += "Allowing religious exemptions might reduce public confidence; consider restricting exemptions to medical reasons only. ";
  }
  // Coverage recommendation
  if (scenario.cov90Check && uptake < 50) {
    rec += "A 90% coverage target is very stringent; ensure clear communication why such a high threshold is needed to justify the prolonged mandate. ";
  }
  // Scenario context insight
  if (scenario.scenarioType === "mild" && uptake < 50) {
    rec += "In a mild outbreak scenario, overall willingness is low. Strengthening the case for the mandate (e.g. emphasizing lives saved) or waiting until risk increases might be prudent. ";
  } else if (scenario.scenarioType === "severe" && uptake >= 50) {
    rec += "Public acceptance is higher under a severe outbreak – maintaining clear messaging on the high risk can sustain compliance. ";
  }
  // High uptake
  if (uptake >= 70) {
    rec = "Uptake is high. The current configuration is likely to be well-accepted and effective.";
  }
  return rec;
}

/***************************************************************************
 * Open modal with single scenario result (triggered by Calculate button)
 ***************************************************************************/
function openSingleScenario() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;
  renderCostsBenefits();  // update cost/benefit info
  const uptakeVal = parseFloat(scenario.predictedUptake);
  const recommendation = getRecommendation(scenario, uptakeVal);
  document.getElementById("modalResults").innerHTML = `<h4>Calculation Results</h4>
    <p><strong>Predicted Uptake:</strong> ${uptakeVal.toFixed(1)}%</p>
    <p>${recommendation}</p>`;
  openModal();
  renderProbChart();
}

/** Modal controls */
function openModal() {
  document.getElementById("resultModal").style.display = "block";
}
function closeModal() {
  document.getElementById("resultModal").style.display = "none";
}

/***************************************************************************
 * Costs & Benefits Calculations and Chart
 ***************************************************************************/
let combinedChartInstance = null;
function renderCostsBenefits() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;
  const country = scenario.country;
  const currencySymbol = (country === "Australia") ? "A$" : "€";
  const coefKey = `${country}_${scenario.scenarioType}`;
  const coefs = coefficientSets[coefKey];
  if (!coefs) return;

  // Recompute probability and participants
  const prob = computeProbability({ 
    coefs: coefs,
    allCheck: scenario.allCheck,
    medRelCheck: scenario.medRelCheck,
    broadCheck: scenario.broadCheck,
    cov70Check: scenario.cov70Check,
    cov90Check: scenario.cov90Check,
    lives_val: scenario.lives_val 
  });
  const basePop = 3000;
  const participants = basePop * prob;
  const uptakePercentage = prob * 100;
  const livesSavedTotal = (scenario.lives_val / 3000) * (basePop * prob);

  const qalyScenario = document.getElementById("qalySelect").value;
  const QALY_SCENARIO_VALUES = { low: 5, moderate: 10, high: 20 };
  const qalyPerLife = QALY_SCENARIO_VALUES[qalyScenario];
  const totalQALY = livesSavedTotal * qalyPerLife;
  const valuePerQALY = 50000;  // local currency
  const monetizedBenefits = totalQALY * valuePerQALY;

  const costPerPerson = 50;
  const fixedCost = (basePop / 3000) * 30000;
  const totalCost = fixedCost + costPerPerson * participants;
  const netBenefitValue = monetizedBenefits - totalCost;

  // Update scenario with formatted net benefit
  scenario.predictedUptake = uptakePercentage.toFixed(2);
  scenario.netBenefit = `${currencySymbol}${netBenefitValue.toFixed(2)}`;

  // Display summary
  const resultDiv = document.getElementById("costsBenefitsResults");
  resultDiv.innerHTML = "";
  const summaryDiv = document.createElement("div");
  summaryDiv.className = "calculation-info";
  summaryDiv.innerHTML = `
    <h4>Cost &amp; Benefit Summary</h4>
    <p><strong>Predicted Uptake:</strong> ${uptakePercentage.toFixed(2)}%</p>
    <p><strong>Population (analyzed):</strong> ${basePop.toLocaleString()}</p>
    <p><strong>Complying Individuals:</strong> ${participants.toFixed(0)}</p>
    <p><strong>Total Lives Saved:</strong> ${livesSavedTotal.toFixed(2)}</p>
    <p><strong>Total QALYs Gained:</strong> ${totalQALY.toFixed(2)}</p>
    <p><strong>Total Intervention Cost:</strong> ${currencySymbol}${totalCost.toFixed(2)}</p>
    <p><strong>Monetized Benefits:</strong> ${currencySymbol}${monetizedBenefits.toFixed(2)}</p>
    <p><strong>Net Benefit:</strong> ${currencySymbol}${netBenefitValue.toFixed(2)}</p>
    <p>The above assumes ${scenario.lives_val} lives saved per 100k with the mandate. Costs include a fixed setup cost and ~$50 per person vaccinated. Benefits are valued at ~${currencySymbol}50k per QALY. Net Benefit = Monetized Benefits – Total Cost.</p>
  `;
  resultDiv.appendChild(summaryDiv);

  // Combined bar chart (cost, benefit, net)
  const chartContainer = document.createElement("div");
  chartContainer.id = "combinedChartContainer";
  chartContainer.innerHTML = `<canvas id="combinedChart"></canvas>`;
  resultDiv.appendChild(chartContainer);
  const ctx = document.getElementById("combinedChart").getContext("2d");
  if (combinedChartInstance) combinedChartInstance.destroy();
  combinedChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ["Total Cost", "Monetized Benefits", "Net Benefit"],
      datasets: [{
        label: `${currencySymbol}`,
        data: [totalCost, monetizedBenefits, netBenefitValue],
        backgroundColor: ['rgba(230, 126, 34, 0.6)', 'rgba(41, 128, 185, 0.6)', 'rgba(39, 174, 96, 0.6)'],
        borderColor: ['rgba(211, 84, 0, 1)', 'rgba(31, 97, 141, 1)', 'rgba(30, 132, 73, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Cost-Benefit Analysis", font: { size: 16 } }
      }
    }
  });
}

/** Toggle display of cost breakdown cards (populated dynamically) */
function toggleCostBreakdown() {
  const breakdownDiv = document.getElementById("detailedCostBreakdown");
  if (breakdownDiv.style.display === "none" || breakdownDiv.style.display === "") {
    // Populate breakdown if empty
    if (breakdownDiv.innerHTML.trim() === "") {
      populateCostBreakdown();
    }
    breakdownDiv.style.display = "flex";
  } else {
    breakdownDiv.style.display = "none";
  }
}

/** Toggle display of benefits analysis (static content) */
function toggleBenefitsAnalysis() {
  const benefitsDiv = document.getElementById("detailedBenefitsAnalysis");
  benefitsDiv.style.display = (benefitsDiv.style.display === "none" || benefitsDiv.style.display === "") ? "flex" : "none";
}

/** Populate cost breakdown cards based on current scenario */
function populateCostBreakdown() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;
  const country = scenario.country;
  const currencySymbol = (country === "Australia") ? "A$" : "€";
  const prob = parseFloat(scenario.predictedUptake) / 100;
  const basePop = 3000;
  const participants = basePop * prob;
  // Define cost components
  const costItems = [
    {
      icon: "fa-building",
      name: "Digital Verification System",
      unitCost: 1000000, quantity: 1,
      description: "IT platform & legal setup (fixed cost)"
    },
    {
      icon: "fa-syringe",
      name: "Vaccines & Administration",
      unitCost: 141.06, quantity: (participants * 2).toFixed(0),
      description: "Vaccine doses + admin per dose:contentReference[oaicite:11]{index=11}"
    },
    {
      icon: "fa-clock",
      name: "Productivity Loss (Side Effects)",
      unitCost: 60.00, quantity: participants.toFixed(0),
      description: "Work hours lost due to post-shot recovery"
    }
    // Additional cost items could be added here if needed
  ];
  const breakdownDiv = document.getElementById("detailedCostBreakdown");
  breakdownDiv.innerHTML = "";  // clear any existing
  costItems.forEach(item => {
    const total = item.unitCost * parseFloat(item.quantity);
    const card = document.createElement("div");
    card.className = "cost-card";
    card.innerHTML = `
      <h4><i class="fa-solid ${item.icon}"></i> ${item.name}</h4>
      <p><strong>Value:</strong> ${currencySymbol}${item.unitCost.toFixed(2)}</p>
      <p><strong>Quantity:</strong> ${item.quantity}</p>
      <p><strong>Total Cost:</strong> ${currencySymbol}${total.toFixed(2)}</p>
      <p><em>${item.description}</em></p>
    `;
    breakdownDiv.appendChild(card);
  });
}

/***************************************************************************
 * Scenario Saving & PDF Export
 ***************************************************************************/
let savedScenarios = [];
function saveScenario() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;
  scenario.name = `Scenario ${savedScenarios.length + 1}`;
  savedScenarios.push(scenario);

  // Add a new row to the table
  const tableBody = document.querySelector("#scenarioTable tbody");
  const row = document.createElement("tr");
  const cols = ["name", "country", "scenarioType", "lives_val", 
                "allCheck", "medRelCheck", "broadCheck", "cov70Check", "cov90Check", 
                "predictedUptake", "netBenefit"];
  cols.forEach(col => {
    const cell = document.createElement("td");
    if (typeof scenario[col] === 'boolean') {
      cell.textContent = scenario[col] ? 'Yes' : 'No';
    } else {
      cell.textContent = scenario[col];
    }
    // Add currency symbol for netBenefit if not already present
    if (col === "netBenefit") cell.style.fontWeight = "600";
    row.appendChild(cell);
  });
  tableBody.appendChild(row);
  alert(`Scenario "${scenario.name}" saved successfully.`);
}

function openComparison() {
  if (savedScenarios.length < 1) {
    alert("Save at least one scenario to export.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFontSize(14);
  doc.text("VaxMandate Policy Simulator - Scenarios Comparison", 310, 30, { align: 'center' });
  let startY = 60;
  savedScenarios.forEach((scen, idx) => {
    if (startY > 700) { doc.addPage(); startY = 30; }
    doc.setFontSize(12);
    doc.text(`${scen.name}: ${scen.country}, ${scen.scenarioType} scenario`, 40, startY);
    startY += 14;
    const details = [
      `Lives Saved per 100k: ${scen.lives_val}`,
      `Scope (All occ): ${scen.allCheck ? 'Yes' : 'No'}`,
      `Med+Rel Exemption: ${scen.medRelCheck ? 'Yes' : 'No'}`,
      `Broad Exemption: ${scen.broadCheck ? 'Yes' : 'No'}`,
      `Coverage 70%: ${scen.cov70Check ? 'Yes' : 'No'}`,
      `Coverage 90%: ${scen.cov90Check ? 'Yes' : 'No'}`,
      `Predicted Uptake: ${parseFloat(scen.predictedUptake).toFixed(1)}%`,
      `Net Benefit: ${scen.netBenefit}`
    ];
    doc.setFontSize(11);
    details.forEach(line => {
      doc.text(line, 60, startY);
      startY += 12;
    });
    startY += 10;
  });
  doc.save("Mandate_Scenarios_Comparison.pdf");
}
