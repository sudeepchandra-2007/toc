const EPSILON = "ε";
const EMPTY_SET = "∅";
const AUTO_PLAY_DELAY = 900;

const appState = {
  theme: localStorage.getItem("automata-theme") || "dark",
  currentView: "dfa-panel",
  dfa: {
    automaton: null,
    simulation: null,
    autoTimer: null,
  },
  nfa: {
    automaton: null,
    simulation: null,
    autoTimer: null,
  },
  converter: {
    dfa: null,
  },
};

const ui = {};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  cacheUi();
  bindNavigation();
  bindThemeToggle();
  bindDfaEvents();
  bindNfaEvents();
  bindConverterEvents();
  applyTheme(appState.theme);
  seedExamples();
  resetSimulationDisplay("dfa");
  resetSimulationDisplay("nfa");
  clearConverterResults();
}

function cacheUi() {
  ui.navButtons = Array.from(document.querySelectorAll(".nav-link"));
  ui.panels = Array.from(document.querySelectorAll(".panel"));
  ui.themeToggle = document.getElementById("theme-toggle");
  ui.themeToggleLabel = document.getElementById("theme-toggle-label");

  ui.dfa = {
    states: document.getElementById("dfa-states"),
    alphabet: document.getElementById("dfa-alphabet"),
    start: document.getElementById("dfa-start"),
    finals: document.getElementById("dfa-finals"),
    inputString: document.getElementById("dfa-input-string"),
    transitionWrapper: document.getElementById("dfa-transition-wrapper"),
    validationMessages: document.getElementById("dfa-validation-messages"),
    graph: document.getElementById("dfa-graph"),
    summary: document.getElementById("dfa-transition-summary"),
    stepLog: document.getElementById("dfa-step-log"),
    status: document.getElementById("dfa-simulation-status"),
    currentState: document.getElementById("dfa-current-state"),
    path: document.getElementById("dfa-transition-path"),
    generateTable: document.getElementById("dfa-generate-table"),
    validate: document.getElementById("dfa-validate"),
    prepare: document.getElementById("dfa-prepare"),
    nextStep: document.getElementById("dfa-next-step"),
    autoPlay: document.getElementById("dfa-auto-play"),
    reset: document.getElementById("dfa-reset"),
    exportJson: document.getElementById("dfa-export-json"),
    importJson: document.getElementById("dfa-import-json"),
  };

  ui.nfa = {
    states: document.getElementById("nfa-states"),
    alphabet: document.getElementById("nfa-alphabet"),
    start: document.getElementById("nfa-start"),
    finals: document.getElementById("nfa-finals"),
    inputString: document.getElementById("nfa-input-string"),
    transitionWrapper: document.getElementById("nfa-transition-wrapper"),
    validationMessages: document.getElementById("nfa-validation-messages"),
    graph: document.getElementById("nfa-graph"),
    summary: document.getElementById("nfa-transition-summary"),
    stepLog: document.getElementById("nfa-step-log"),
    status: document.getElementById("nfa-simulation-status"),
    currentStates: document.getElementById("nfa-current-states"),
    path: document.getElementById("nfa-closure-path"),
    generateTable: document.getElementById("nfa-generate-table"),
    validate: document.getElementById("nfa-validate"),
    prepare: document.getElementById("nfa-prepare"),
    nextStep: document.getElementById("nfa-next-step"),
    autoPlay: document.getElementById("nfa-auto-play"),
    reset: document.getElementById("nfa-reset"),
    exportJson: document.getElementById("nfa-export-json"),
    importJson: document.getElementById("nfa-import-json"),
  };

  ui.converter = {
    convert: document.getElementById("convert-nfa-button"),
    exportJson: document.getElementById("converter-export-json"),
    messages: document.getElementById("converter-messages"),
    log: document.getElementById("converter-log"),
    summary: document.getElementById("converter-summary"),
    tableWrapper: document.getElementById("converter-table-wrapper"),
    graph: document.getElementById("converter-graph"),
    sourceStates: document.getElementById("converter-source-states"),
    resultStates: document.getElementById("converter-result-states"),
    startState: document.getElementById("converter-start-state"),
  };
}

function bindNavigation() {
  ui.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      appState.currentView = button.dataset.viewTarget;
      ui.navButtons.forEach((item) => item.classList.toggle("active", item === button));
      ui.panels.forEach((panel) => panel.classList.toggle("active", panel.id === appState.currentView));
    });
  });
}

function bindThemeToggle() {
  ui.themeToggle.addEventListener("click", () => {
    appState.theme = appState.theme === "dark" ? "light" : "dark";
    localStorage.setItem("automata-theme", appState.theme);
    applyTheme(appState.theme);
  });
}

function bindDfaEvents() {
  ui.dfa.generateTable.addEventListener("click", () => {
    renderDfaTable();
    clearSimulation("dfa");
  });
  ui.dfa.validate.addEventListener("click", () => validateDfa(true));
  ui.dfa.prepare.addEventListener("click", prepareDfaSimulation);
  ui.dfa.nextStep.addEventListener("click", () => advanceSimulation("dfa"));
  ui.dfa.autoPlay.addEventListener("click", () => toggleAutoPlay("dfa"));
  ui.dfa.reset.addEventListener("click", () => clearSimulation("dfa"));
  ui.dfa.exportJson.addEventListener("click", () => exportAutomaton("dfa"));
  ui.dfa.importJson.addEventListener("change", (event) => importAutomaton(event, "dfa"));

  getDefinitionInputs("dfa").forEach((input) => {
    input.addEventListener("input", () => clearSimulation("dfa"));
  });

  ui.dfa.transitionWrapper.addEventListener("input", () => clearSimulation("dfa"));
}

function bindNfaEvents() {
  ui.nfa.generateTable.addEventListener("click", () => {
    renderNfaTable();
    clearSimulation("nfa");
    clearConverterResults();
  });
  ui.nfa.validate.addEventListener("click", () => validateNfa(true));
  ui.nfa.prepare.addEventListener("click", prepareNfaSimulation);
  ui.nfa.nextStep.addEventListener("click", () => advanceSimulation("nfa"));
  ui.nfa.autoPlay.addEventListener("click", () => toggleAutoPlay("nfa"));
  ui.nfa.reset.addEventListener("click", () => clearSimulation("nfa"));
  ui.nfa.exportJson.addEventListener("click", () => exportAutomaton("nfa"));
  ui.nfa.importJson.addEventListener("change", (event) => importAutomaton(event, "nfa"));

  getDefinitionInputs("nfa").forEach((input) => {
    input.addEventListener("input", () => {
      clearSimulation("nfa");
      clearConverterResults();
    });
  });

  ui.nfa.transitionWrapper.addEventListener("input", () => {
    clearSimulation("nfa");
    clearConverterResults();
  });
}

function bindConverterEvents() {
  ui.converter.convert.addEventListener("click", convertCurrentNfa);
  ui.converter.exportJson.addEventListener("click", () => exportAutomaton("converter"));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  ui.themeToggleLabel.textContent = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

function seedExamples() {
  const dfaExample = {
    type: "DFA",
    states: ["qEven", "qOdd"],
    alphabet: ["0", "1"],
    startState: "qEven",
    finalStates: ["qEven"],
    transitions: {
      qEven: { "0": "qEven", "1": "qOdd" },
      qOdd: { "0": "qOdd", "1": "qEven" },
    },
  };

  const nfaExample = {
    type: "NFA",
    states: ["q0", "q1", "q2", "q3"],
    alphabet: ["a", "b"],
    startState: "q0",
    finalStates: ["q3"],
    transitions: {
      q0: { a: [], b: [], [EPSILON]: ["q1", "q2"] },
      q1: { a: ["q1"], b: ["q3"], [EPSILON]: [] },
      q2: { a: ["q3"], b: ["q2"], [EPSILON]: [] },
      q3: { a: ["q3"], b: ["q3"], [EPSILON]: [] },
    },
  };

  populateAutomatonForm("dfa", dfaExample);
  renderDfaTable(buildDraftFromTransitionMap(dfaExample.transitions));
  validateDfa(true);

  populateAutomatonForm("nfa", nfaExample);
  renderNfaTable(buildDraftFromTransitionMap(nfaExample.transitions, true));
  validateNfa(true);
}

function populateAutomatonForm(kind, automaton) {
  const target = ui[kind];
  target.states.value = automaton.states.join(",");
  target.alphabet.value = automaton.alphabet.join(",");
  target.start.value = automaton.startState;
  target.finals.value = automaton.finalStates.join(",");
}

function getDefinitionInputs(kind) {
  return [ui[kind].states, ui[kind].alphabet, ui[kind].start, ui[kind].finals, ui[kind].inputString];
}

function renderDfaTable(prefillDraft = null) {
  const states = parseCSVUnique(ui.dfa.states.value);
  const alphabet = parseCSVUnique(ui.dfa.alphabet.value);
  const existingDraft = prefillDraft || collectTableDraft(ui.dfa.transitionWrapper);
  renderEditableTable({
    wrapper: ui.dfa.transitionWrapper,
    states,
    symbols: alphabet,
    draft: existingDraft,
    allowMultiple: false,
    placeholder: "Enter states and alphabet, then generate the transition table.",
  });
}

function renderNfaTable(prefillDraft = null) {
  const states = parseCSVUnique(ui.nfa.states.value);
  const alphabet = parseCSVUnique(ui.nfa.alphabet.value);
  const existingDraft = prefillDraft || collectTableDraft(ui.nfa.transitionWrapper);
  renderEditableTable({
    wrapper: ui.nfa.transitionWrapper,
    states,
    symbols: [...alphabet, EPSILON],
    draft: existingDraft,
    allowMultiple: true,
    placeholder: "Enter states and alphabet, then generate the transition table.",
  });
}

function renderEditableTable({ wrapper, states, symbols, draft, allowMultiple, placeholder }) {
  if (!states.length || !symbols.length) {
    setPlaceholder(wrapper, placeholder);
    return;
  }

  wrapper.classList.remove("placeholder-panel");
  wrapper.innerHTML = "";

  const table = document.createElement("table");
  table.className = "transition-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const topLeft = document.createElement("th");
  topLeft.textContent = "State";
  headRow.appendChild(topLeft);

  symbols.forEach((symbol) => {
    const th = document.createElement("th");
    th.textContent = symbol;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  states.forEach((state) => {
    const row = document.createElement("tr");
    const stateHeader = document.createElement("th");
    stateHeader.scope = "row";
    stateHeader.textContent = state;
    row.appendChild(stateHeader);

    symbols.forEach((symbol) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "transition-input";
      input.dataset.state = state;
      input.dataset.symbol = symbol;
      input.placeholder = allowMultiple ? "q1,q2" : "q1";
      input.value = draft[cellKey(state, symbol)] || "";
      td.appendChild(input);
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
}

function collectTableDraft(wrapper) {
  const draft = {};
  wrapper.querySelectorAll(".transition-input").forEach((input) => {
    draft[cellKey(input.dataset.state, input.dataset.symbol)] = input.value.trim();
  });
  return draft;
}

function buildDraftFromTransitionMap(transitions, allowMultiple = false) {
  const draft = {};
  Object.entries(transitions || {}).forEach(([state, mapping]) => {
    Object.entries(mapping || {}).forEach(([symbol, target]) => {
      draft[cellKey(state, symbol)] = allowMultiple || Array.isArray(target)
        ? (Array.isArray(target) ? target.join(",") : String(target))
        : String(target);
    });
  });
  return draft;
}

function validateDfa(showMessages = true) {
  stopAutoPlay("dfa");

  const states = parseCSVUnique(ui.dfa.states.value);
  const alphabet = parseCSVUnique(ui.dfa.alphabet.value);
  const startState = ui.dfa.start.value.trim();
  const finalStates = parseCSVUnique(ui.dfa.finals.value);
  const errors = [];
  const transitions = {};

  if (!states.length) {
    errors.push("Add at least one DFA state.");
  }
  if (!alphabet.length) {
    errors.push("Add at least one alphabet symbol.");
  }
  if (alphabet.includes(EPSILON)) {
    errors.push(`The DFA alphabet cannot contain ${EPSILON}.`);
  }
  if (!startState) {
    errors.push("Provide a DFA start state.");
  } else if (!states.includes(startState)) {
    errors.push("The DFA start state must be one of the listed states.");
  }
  if (finalStates.some((state) => !states.includes(state))) {
    errors.push("Every DFA final state must be included in the states list.");
  }
  if (!ui.dfa.transitionWrapper.querySelector(".transition-table")) {
    errors.push("Generate and fill the DFA transition table.");
  }

  if (!errors.length) {
    const draft = collectTableDraft(ui.dfa.transitionWrapper);
    states.forEach((state) => {
      transitions[state] = {};
      alphabet.forEach((symbol) => {
        const rawValue = (draft[cellKey(state, symbol)] || "").trim();
        const targets = parseCSVList(rawValue, false);
        if (!rawValue) {
          errors.push(`Missing DFA transition for δ(${state}, ${symbol}).`);
          return;
        }
        if (targets.length !== 1) {
          errors.push(`DFA transition δ(${state}, ${symbol}) must have exactly one target.`);
          return;
        }
        if (!states.includes(targets[0])) {
          errors.push(`DFA transition δ(${state}, ${symbol}) points to an unknown state.`);
          return;
        }
        transitions[state][symbol] = targets[0];
      });
    });
  }

  if (errors.length) {
    appState.dfa.automaton = null;
    clearSimulation("dfa", false);
    renderAutomatonSummary(ui.dfa.summary, null, "DFA details will appear here after validation.");
    renderAutomatonGraph(ui.dfa.graph, null);
    resetSimulationDisplay("dfa");
    if (showMessages) {
      renderMessages(ui.dfa.validationMessages, errors, "error");
    }
    return null;
  }

  const automaton = {
    type: "DFA",
    states,
    alphabet,
    startState,
    finalStates,
    transitions,
  };

  appState.dfa.automaton = automaton;
  clearSimulation("dfa", false);
  renderAutomatonSummary(ui.dfa.summary, automaton);
  renderAutomatonGraph(ui.dfa.graph, automaton, new Set());
  resetSimulationDisplay("dfa");

  if (showMessages) {
    renderMessages(ui.dfa.validationMessages, ["DFA validated successfully and is ready to simulate."], "success");
  }

  return automaton;
}

function validateNfa(showMessages = true) {
  stopAutoPlay("nfa");

  const states = parseCSVUnique(ui.nfa.states.value);
  const alphabet = parseCSVUnique(ui.nfa.alphabet.value);
  const startState = ui.nfa.start.value.trim();
  const finalStates = parseCSVUnique(ui.nfa.finals.value);
  const errors = [];
  const transitions = {};

  if (!states.length) {
    errors.push("Add at least one NFA state.");
  }
  if (!alphabet.length) {
    errors.push("Add at least one alphabet symbol.");
  }
  if (alphabet.includes(EPSILON)) {
    errors.push(`The NFA alphabet cannot contain ${EPSILON}; use the dedicated epsilon column instead.`);
  }
  if (!startState) {
    errors.push("Provide an NFA start state.");
  } else if (!states.includes(startState)) {
    errors.push("The NFA start state must be one of the listed states.");
  }
  if (finalStates.some((state) => !states.includes(state))) {
    errors.push("Every NFA final state must be included in the states list.");
  }
  if (!ui.nfa.transitionWrapper.querySelector(".transition-table")) {
    errors.push("Generate and fill the NFA transition table.");
  }

  if (!errors.length) {
    const draft = collectTableDraft(ui.nfa.transitionWrapper);
    const symbols = [...alphabet, EPSILON];

    states.forEach((state) => {
      transitions[state] = {};
      symbols.forEach((symbol) => {
        const rawValue = (draft[cellKey(state, symbol)] || "").trim();
        const targets = parseCSVList(rawValue, true);
        const invalidTarget = targets.find((target) => !states.includes(target));
        if (invalidTarget) {
          errors.push(`NFA transition from ${state} on ${symbol} points to unknown state "${invalidTarget}".`);
          return;
        }
        transitions[state][symbol] = targets;
      });
    });
  }

  if (errors.length) {
    appState.nfa.automaton = null;
    clearSimulation("nfa", false);
    renderAutomatonSummary(ui.nfa.summary, null, "NFA details will appear here after validation.");
    renderAutomatonGraph(ui.nfa.graph, null);
    resetSimulationDisplay("nfa");
    if (showMessages) {
      renderMessages(ui.nfa.validationMessages, errors, "error");
    }
    return null;
  }

  const automaton = {
    type: "NFA",
    states,
    alphabet,
    startState,
    finalStates,
    transitions,
  };

  appState.nfa.automaton = automaton;
  clearSimulation("nfa", false);
  renderAutomatonSummary(ui.nfa.summary, automaton);
  renderAutomatonGraph(ui.nfa.graph, automaton, new Set());
  resetSimulationDisplay("nfa");

  if (showMessages) {
    renderMessages(ui.nfa.validationMessages, ["NFA validated successfully and is ready to simulate or convert."], "success");
  }

  return automaton;
}

function prepareDfaSimulation() {
  const automaton = validateDfa(true);
  if (!automaton) {
    return;
  }

  const tokenResult = tokenizeInput(ui.dfa.inputString.value, automaton.alphabet);
  if (tokenResult.error) {
    renderMessages(ui.dfa.validationMessages, [tokenResult.error], "error");
    return;
  }

  const invalidToken = tokenResult.tokens.find((token) => !automaton.alphabet.includes(token));
  if (invalidToken) {
    renderMessages(ui.dfa.validationMessages, [`"${invalidToken}" is not part of the DFA alphabet.`], "error");
    return;
  }

  appState.dfa.simulation = buildDfaSimulation(automaton, tokenResult.tokens);
  renderMessages(ui.dfa.validationMessages, [`Prepared ${countMeaningfulSteps(appState.dfa.simulation)} DFA steps for ${formatTokenSequence(tokenResult.tokens)}.`], "info");
  renderDfaSimulation();
}

function prepareNfaSimulation() {
  const automaton = validateNfa(true);
  if (!automaton) {
    return;
  }

  const tokenResult = tokenizeInput(ui.nfa.inputString.value, automaton.alphabet);
  if (tokenResult.error) {
    renderMessages(ui.nfa.validationMessages, [tokenResult.error], "error");
    return;
  }

  const invalidToken = tokenResult.tokens.find((token) => !automaton.alphabet.includes(token));
  if (invalidToken) {
    renderMessages(ui.nfa.validationMessages, [`"${invalidToken}" is not part of the NFA alphabet.`], "error");
    return;
  }

  appState.nfa.simulation = buildNfaSimulation(automaton, tokenResult.tokens);
  renderMessages(ui.nfa.validationMessages, [`Prepared ${countMeaningfulSteps(appState.nfa.simulation)} NFA steps for ${formatTokenSequence(tokenResult.tokens)}.`], "info");
  renderNfaSimulation();
}

function buildDfaSimulation(automaton, tokens) {
  const steps = [
    {
      kind: "start",
      title: "Start",
      description: `Begin at state ${automaton.startState}.`,
      activeStates: [automaton.startState],
      currentState: automaton.startState,
    },
  ];

  let currentState = automaton.startState;
  const path = [currentState];

  tokens.forEach((symbol, index) => {
    const nextState = automaton.transitions[currentState][symbol];
    steps.push({
      kind: "transition",
      title: `Symbol ${index + 1}`,
      description: `Read "${symbol}": ${currentState} → ${nextState}.`,
      activeStates: [nextState],
      currentState: nextState,
      symbol,
    });
    currentState = nextState;
    path.push(currentState);
  });

  const accepted = automaton.finalStates.includes(currentState);
  steps.push({
    kind: "result",
    title: "Result",
    description: accepted
      ? `ACCEPTED because ${currentState} is a final state.`
      : `REJECTED because ${currentState} is not a final state.`,
    activeStates: [currentState],
    currentState,
    accepted,
  });

  return {
    type: "dfa",
    tokens,
    steps,
    pointer: 0,
    accepted,
    path,
  };
}

function buildNfaSimulation(automaton, tokens) {
  const startClosure = epsilonClosure(automaton, new Set([automaton.startState]));
  const steps = [
    {
      kind: "start",
      title: "Start",
      description: `Start with ε-closure(${automaton.startState}) = ${displaySet(startClosure)}.`,
      activeStates: Array.from(startClosure),
      stateSet: Array.from(startClosure),
    },
  ];

  let currentSet = startClosure;
  const trace = [displaySet(currentSet)];

  tokens.forEach((symbol, index) => {
    const moved = moveNfa(automaton, currentSet, symbol);
    const closed = epsilonClosure(automaton, moved);
    steps.push({
      kind: "transition",
      title: `Symbol ${index + 1}`,
      description: `Read "${symbol}": move = ${displaySet(moved)}, ε-closure = ${displaySet(closed)}.`,
      activeStates: Array.from(closed),
      stateSet: Array.from(closed),
      symbol,
    });
    currentSet = closed;
    trace.push(displaySet(currentSet));
  });

  const accepted = Array.from(currentSet).some((state) => automaton.finalStates.includes(state));
  steps.push({
    kind: "result",
    title: "Result",
    description: accepted
      ? `ACCEPTED because ${displaySet(currentSet)} intersects the final-state set.`
      : `REJECTED because ${displaySet(currentSet)} contains no final state.`,
    activeStates: Array.from(currentSet),
    stateSet: Array.from(currentSet),
    accepted,
  });

  return {
    type: "nfa",
    tokens,
    steps,
    pointer: 0,
    accepted,
    trace,
  };
}

function advanceSimulation(kind) {
  const bucket = appState[kind];
  if (!bucket.simulation) {
    return false;
  }

  if (bucket.simulation.pointer >= bucket.simulation.steps.length - 1) {
    stopAutoPlay(kind);
    return true;
  }

  bucket.simulation.pointer += 1;
  if (kind === "dfa") {
    renderDfaSimulation();
  } else {
    renderNfaSimulation();
  }

  const finished = bucket.simulation.pointer >= bucket.simulation.steps.length - 1;
  if (finished) {
    stopAutoPlay(kind);
  }
  return finished;
}

function toggleAutoPlay(kind) {
  const bucket = appState[kind];

  if (!bucket.simulation) {
    if (kind === "dfa") {
      prepareDfaSimulation();
    } else {
      prepareNfaSimulation();
    }
  }

  if (!bucket.simulation || bucket.simulation.pointer >= bucket.simulation.steps.length - 1) {
    return;
  }

  if (bucket.autoTimer) {
    stopAutoPlay(kind);
    kind === "dfa" ? renderDfaSimulation() : renderNfaSimulation();
    return;
  }

  bucket.autoTimer = window.setInterval(() => {
    const finished = advanceSimulation(kind);
    if (finished) {
      stopAutoPlay(kind);
    }
  }, AUTO_PLAY_DELAY);

  kind === "dfa" ? renderDfaSimulation() : renderNfaSimulation();
}

function stopAutoPlay(kind) {
  const bucket = appState[kind];
  if (bucket.autoTimer) {
    window.clearInterval(bucket.autoTimer);
    bucket.autoTimer = null;
  }
}

function clearSimulation(kind, shouldRender = true) {
  stopAutoPlay(kind);
  appState[kind].simulation = null;
  if (shouldRender) {
    resetSimulationDisplay(kind);
  }
}

function resetSimulationDisplay(kind) {
  if (kind === "dfa") {
    const automaton = appState.dfa.automaton;
    setStatusBadge(ui.dfa.status, "Awaiting simulation", "neutral");
    ui.dfa.currentState.textContent = "-";
    ui.dfa.path.textContent = "-";
    setPlaceholder(ui.dfa.stepLog, "Prepare a simulation to see the execution log.");
    renderAutomatonGraph(ui.dfa.graph, automaton, new Set());
    updateDfaButtons();
    return;
  }

  const automaton = appState.nfa.automaton;
  setStatusBadge(ui.nfa.status, "Awaiting simulation", "neutral");
  ui.nfa.currentStates.textContent = "-";
  ui.nfa.path.textContent = "-";
  setPlaceholder(ui.nfa.stepLog, "Prepare a simulation to see epsilon-closure and move steps.");
  renderAutomatonGraph(ui.nfa.graph, automaton, new Set());
  updateNfaButtons();
}

function renderDfaSimulation() {
  const simulation = appState.dfa.simulation;
  const automaton = appState.dfa.automaton;

  if (!simulation || !automaton) {
    resetSimulationDisplay("dfa");
    return;
  }

  const currentStep = simulation.steps[simulation.pointer];
  const visibleSteps = simulation.steps.slice(0, simulation.pointer + 1);
  const consumedTransitions = visibleSteps.filter((step) => step.kind === "transition").length;

  ui.dfa.currentState.textContent = currentStep.currentState || "-";
  ui.dfa.path.textContent = simulation.path.slice(0, consumedTransitions + 1).join(" → ");
  renderStepLog(ui.dfa.stepLog, visibleSteps, visibleSteps.length - 1);
  renderAutomatonGraph(ui.dfa.graph, automaton, new Set(currentStep.activeStates || []));

  if (currentStep.kind === "result") {
    setStatusBadge(ui.dfa.status, currentStep.accepted ? "ACCEPTED" : "REJECTED", currentStep.accepted ? "accepted" : "rejected");
  } else {
    setStatusBadge(
      ui.dfa.status,
      appState.dfa.autoTimer ? "Auto playing" : `Step ${consumedTransitions} of ${Math.max(simulation.steps.length - 2, 0)}`,
      "working"
    );
  }

  updateDfaButtons();
}

function renderNfaSimulation() {
  const simulation = appState.nfa.simulation;
  const automaton = appState.nfa.automaton;

  if (!simulation || !automaton) {
    resetSimulationDisplay("nfa");
    return;
  }

  const currentStep = simulation.steps[simulation.pointer];
  const visibleSteps = simulation.steps.slice(0, simulation.pointer + 1);
  const consumedTransitions = visibleSteps.filter((step) => step.kind === "transition").length;

  ui.nfa.currentStates.textContent = displaySet(new Set(currentStep.stateSet || []));
  ui.nfa.path.textContent = simulation.trace.slice(0, consumedTransitions + 1).join(" → ");
  renderStepLog(ui.nfa.stepLog, visibleSteps, visibleSteps.length - 1);
  renderAutomatonGraph(ui.nfa.graph, automaton, new Set(currentStep.activeStates || []));

  if (currentStep.kind === "result") {
    setStatusBadge(ui.nfa.status, currentStep.accepted ? "ACCEPTED" : "REJECTED", currentStep.accepted ? "accepted" : "rejected");
  } else {
    setStatusBadge(
      ui.nfa.status,
      appState.nfa.autoTimer ? "Auto playing" : `Step ${consumedTransitions} of ${Math.max(simulation.steps.length - 2, 0)}`,
      "working"
    );
  }

  updateNfaButtons();
}

function updateDfaButtons() {
  const simulation = appState.dfa.simulation;
  const isFinished = !simulation || simulation.pointer >= simulation.steps.length - 1;
  ui.dfa.nextStep.disabled = !simulation || isFinished;
  ui.dfa.autoPlay.disabled = !simulation || isFinished;
  ui.dfa.autoPlay.textContent = appState.dfa.autoTimer ? "Pause" : "Auto Play";
}

function updateNfaButtons() {
  const simulation = appState.nfa.simulation;
  const isFinished = !simulation || simulation.pointer >= simulation.steps.length - 1;
  ui.nfa.nextStep.disabled = !simulation || isFinished;
  ui.nfa.autoPlay.disabled = !simulation || isFinished;
  ui.nfa.autoPlay.textContent = appState.nfa.autoTimer ? "Pause" : "Auto Play";
}

function convertCurrentNfa() {
  const nfa = validateNfa(true);
  if (!nfa) {
    return;
  }

  const converted = convertNfaToDfa(nfa);
  appState.converter.dfa = converted;

  renderMessages(ui.converter.messages, ["Subset construction completed successfully."], "success");
  ui.converter.sourceStates.textContent = `${nfa.states.length} states`;
  ui.converter.resultStates.textContent = `${converted.states.length} states`;
  ui.converter.startState.textContent = converted.startState;

  renderStepLog(
    ui.converter.log,
    converted.log.map((line, index) => ({
      title: `Step ${index + 1}`,
      description: line,
    })),
    converted.log.length - 1
  );

  const subsetMarkup = Object.entries(converted.subsetMembers).map(([label, members]) => {
    return `<span class="subset-chip">${escapeHtml(label)} = ${escapeHtml(displaySet(new Set(members)))}</span>`;
  }).join("");

  renderAutomatonSummary(
    ui.converter.summary,
    converted,
    "",
    subsetMarkup ? `<div><span class="section-kicker">Subset States</span><div class="subset-chip-list">${subsetMarkup}</div></div>` : ""
  );
  renderReadOnlyTable(ui.converter.tableWrapper, converted);
  renderAutomatonGraph(ui.converter.graph, converted, new Set([converted.startState]));
}

function convertNfaToDfa(nfa) {
  const startSet = epsilonClosure(nfa, new Set([nfa.startState]));
  const queue = [startSet];
  const discovered = new Map([[setKey(startSet), startSet]]);
  const transitions = {};
  const subsetMembers = {};
  const log = [`Start subset = ε-closure(${nfa.startState}) = ${displaySet(startSet)}.`];

  while (queue.length) {
    const currentSet = queue.shift();
    const currentLabel = subsetLabel(currentSet);
    subsetMembers[currentLabel] = Array.from(currentSet).sort();
    transitions[currentLabel] = {};

    nfa.alphabet.forEach((symbol) => {
      const moved = moveNfa(nfa, currentSet, symbol);
      const closed = epsilonClosure(nfa, moved);
      const targetLabel = subsetLabel(closed);
      transitions[currentLabel][symbol] = targetLabel;
      log.push(`δ(${currentLabel}, ${symbol}) = ${displaySet(moved)} ⇒ ${targetLabel}.`);

      const key = setKey(closed);
      if (!discovered.has(key)) {
        discovered.set(key, closed);
        queue.push(closed);
      }
    });
  }

  const states = Array.from(discovered.values()).map((set) => subsetLabel(set));
  const finalStates = states.filter((label) => (subsetMembers[label] || []).some((state) => nfa.finalStates.includes(state)));

  return {
    type: "DFA",
    states,
    alphabet: [...nfa.alphabet],
    startState: subsetLabel(startSet),
    finalStates,
    transitions,
    subsetMembers,
    log,
  };
}

function epsilonClosure(automaton, initialStates) {
  const closure = new Set(initialStates);
  const stack = Array.from(initialStates);

  while (stack.length) {
    const state = stack.pop();
    const epsilonTargets = (automaton.transitions[state] && automaton.transitions[state][EPSILON]) || [];
    epsilonTargets.forEach((target) => {
      if (!closure.has(target)) {
        closure.add(target);
        stack.push(target);
      }
    });
  }

  return closure;
}

function moveNfa(automaton, states, symbol) {
  const result = new Set();
  Array.from(states).forEach((state) => {
    const targets = (automaton.transitions[state] && automaton.transitions[state][symbol]) || [];
    targets.forEach((target) => result.add(target));
  });
  return result;
}

function renderAutomatonSummary(container, automaton, placeholderMessage = "", extraMarkup = "") {
  if (!automaton) {
    setPlaceholder(container, placeholderMessage || "No automaton available.");
    return;
  }

  const transitions = collectEdgeDefinitions(automaton).map((edge) => {
    return `<span class="transition-chip">${escapeHtml(edge.source)} -- ${escapeHtml(edge.labels.join(", "))} → ${escapeHtml(edge.target)}</span>`;
  }).join("");

  container.classList.remove("placeholder-panel");
  container.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <span>States</span>
        <strong>${escapeHtml(automaton.states.join(", "))}</strong>
      </div>
      <div class="summary-card">
        <span>Alphabet</span>
        <strong>${escapeHtml(automaton.alphabet.join(", "))}</strong>
      </div>
      <div class="summary-card">
        <span>Start State</span>
        <code>${escapeHtml(automaton.startState)}</code>
      </div>
      <div class="summary-card">
        <span>Final States</span>
        <code>${escapeHtml(automaton.finalStates.join(", ") || "None")}</code>
      </div>
    </div>
    <div>
      <span class="section-kicker">Transitions</span>
      <div class="transition-chip-list">${transitions || `<span class="transition-chip">${EMPTY_SET}</span>`}</div>
    </div>
    ${extraMarkup}
  `;
}

function renderReadOnlyTable(wrapper, automaton) {
  if (!automaton) {
    setPlaceholder(wrapper, "Converted transitions will appear here after running the converter.");
    return;
  }

  wrapper.classList.remove("placeholder-panel");
  wrapper.innerHTML = "";

  const table = document.createElement("table");
  table.className = "transition-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const leftHeader = document.createElement("th");
  leftHeader.textContent = "State";
  headRow.appendChild(leftHeader);

  automaton.alphabet.forEach((symbol) => {
    const th = document.createElement("th");
    th.textContent = symbol;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  automaton.states.forEach((state) => {
    const row = document.createElement("tr");
    const header = document.createElement("th");
    header.scope = "row";
    header.textContent = state;
    row.appendChild(header);

    automaton.alphabet.forEach((symbol) => {
      const td = document.createElement("td");
      const value = automaton.transitions[state] ? automaton.transitions[state][symbol] : "";
      const cell = document.createElement("span");
      cell.className = "readonly-cell";
      cell.textContent = Array.isArray(value) ? (value.length ? value.join(",") : EMPTY_SET) : (value || EMPTY_SET);
      td.appendChild(cell);
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
}

function renderStepLog(container, steps, currentIndex) {
  if (!steps.length) {
    setPlaceholder(container, "No steps to display yet.");
    return;
  }

  container.classList.remove("placeholder-panel");
  container.innerHTML = steps.map((step, index) => {
    const title = typeof step.title === "string" ? step.title : `Step ${index + 1}`;
    return `
      <div class="log-entry${index === currentIndex ? " current" : ""}">
        <div class="log-line-title">${escapeHtml(title)}</div>
        <div class="log-line-copy">${escapeHtml(step.description)}</div>
      </div>
    `;
  }).join("");
}

function renderAutomatonGraph(container, automaton, activeStates = new Set()) {
  if (!automaton || !automaton.states.length) {
    setPlaceholder(container, "Validate the automaton to visualize its state graph.");
    return;
  }

  const graph = buildGraphData(automaton);
  const markerId = `${container.id}-arrow`;

  const svg = `
    <svg class="graph-svg" viewBox="0 0 ${graph.width} ${graph.height}" role="img" aria-label="${escapeHtml(automaton.type)} state graph">
      <defs>
        <marker id="${escapeHtml(markerId)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
        </marker>
      </defs>
      <g class="graph-viewport">
        ${renderStartIndicator(graph, automaton.startState, markerId)}
        ${graph.edges.map((edge) => renderEdge(edge, markerId)).join("")}
        ${graph.nodes.map((node) => renderNode(node, automaton.startState, automaton.finalStates.includes(node.id), activeStates.has(node.id))).join("")}
      </g>
    </svg>
    ${window.d3 ? '<div class="zoom-hint">Scroll to zoom and drag to pan</div>' : ""}
  `;

  container.classList.remove("placeholder-panel");
  container.innerHTML = svg;
  enhanceGraphWithD3(container);
}

function buildGraphData(automaton) {
  const width = 760;
  const height = 420;
  const longestLabel = Math.max(...automaton.states.map((state) => String(state).length), 2);
  const nodeRadius = Math.min(58, Math.max(28, longestLabel * 3.5));
  const angleStep = (Math.PI * 2) / Math.max(automaton.states.length, 1);
  const centerX = width / 2;
  const centerY = height / 2;
  const orbitRadius = Math.max(90, Math.min(width, height) / 2 - nodeRadius - 26);

  const nodes = automaton.states.map((state, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    return {
      id: state,
      x: centerX + orbitRadius * Math.cos(angle),
      y: centerY + orbitRadius * Math.sin(angle),
      radius: nodeRadius,
    };
  });

  const nodeLookup = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const rawEdges = collectEdgeDefinitions(automaton);
  const edges = rawEdges.map((edge) => ({
    ...edge,
    sourceNode: nodeLookup[edge.source],
    targetNode: nodeLookup[edge.target],
    reciprocal: rawEdges.some((candidate) => candidate.source === edge.target && candidate.target === edge.source && candidate.source !== candidate.target),
  }));

  return { width, height, nodes, edges };
}

function collectEdgeDefinitions(automaton) {
  const edgeMap = new Map();

  automaton.states.forEach((state) => {
    const mapping = automaton.transitions[state] || {};
    Object.entries(mapping).forEach(([symbol, rawTarget]) => {
      const targets = Array.isArray(rawTarget) ? rawTarget : [rawTarget];
      targets.filter(Boolean).forEach((target) => {
        const key = `${state}__${target}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            source: state,
            target,
            labels: [],
          });
        }
        edgeMap.get(key).labels.push(symbol);
      });
    });
  });

  return Array.from(edgeMap.values()).map((edge) => ({
    ...edge,
    labels: Array.from(new Set(edge.labels)).sort(),
  }));
}

function renderStartIndicator(graph, startState, markerId) {
  const node = graph.nodes.find((item) => item.id === startState);
  if (!node) {
    return "";
  }

  const startX = node.x - node.radius - 34;
  const endX = node.x - node.radius - 6;
  return `
    <g class="graph-start-indicator" style="color: var(--edge);">
      <path d="M ${startX} ${node.y} L ${endX} ${node.y}" marker-end="url(#${escapeHtml(markerId)})"></path>
    </g>
  `;
}

function renderEdge(edge, markerId) {
  const label = edge.labels.join(", ");
  if (!edge.sourceNode || !edge.targetNode) {
    return "";
  }

  if (edge.source === edge.target) {
    const x = edge.sourceNode.x;
    const y = edge.sourceNode.y;
    const r = edge.sourceNode.radius;
    const path = `M ${x} ${y - r} C ${x + 36} ${y - r - 42}, ${x - 36} ${y - r - 42}, ${x} ${y - r}`;
    return `
      <g class="graph-edge" style="color: var(--edge);">
        <path d="${path}" marker-end="url(#${escapeHtml(markerId)})"></path>
        <text x="${x}" y="${y - r - 46}" text-anchor="middle">${escapeHtml(label)}</text>
      </g>
    `;
  }

  const dx = edge.targetNode.x - edge.sourceNode.x;
  const dy = edge.targetNode.y - edge.sourceNode.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const normX = dx / distance;
  const normY = dy / distance;
  const curve = edge.reciprocal ? (edge.source < edge.target ? 28 : -28) : 0;
  const offsetX = -normY * curve;
  const offsetY = normX * curve;
  const startX = edge.sourceNode.x + normX * edge.sourceNode.radius;
  const startY = edge.sourceNode.y + normY * edge.sourceNode.radius;
  const endX = edge.targetNode.x - normX * edge.targetNode.radius;
  const endY = edge.targetNode.y - normY * edge.targetNode.radius;
  const controlX = (edge.sourceNode.x + edge.targetNode.x) / 2 + offsetX;
  const controlY = (edge.sourceNode.y + edge.targetNode.y) / 2 + offsetY;
  const labelPoint = quadraticPoint(startX, startY, controlX, controlY, endX, endY, 0.5);

  return `
    <g class="graph-edge" style="color: var(--edge);">
      <path d="M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}" marker-end="url(#${escapeHtml(markerId)})"></path>
      <text x="${labelPoint.x}" y="${labelPoint.y - 8}" text-anchor="middle">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderNode(node, startState, isFinal, isActive) {
  const fontSize = Math.max(10, 15 - Math.floor(String(node.id).length / 4));
  return `
    <g class="graph-node${node.id === startState ? " start" : ""}${isFinal ? " final" : ""}${isActive ? " active" : ""}" transform="translate(${node.x} ${node.y})">
      <circle class="node-ring" r="${node.radius}"></circle>
      ${isFinal ? `<circle class="node-final" r="${node.radius - 7}"></circle>` : ""}
      <text text-anchor="middle" dominant-baseline="middle" style="font-size:${fontSize}px;">${escapeHtml(node.id)}</text>
    </g>
  `;
}

function enhanceGraphWithD3(container) {
  if (!window.d3) {
    return;
  }

  const svgNode = container.querySelector("svg.graph-svg");
  const viewportNode = container.querySelector(".graph-viewport");
  if (!svgNode || !viewportNode) {
    return;
  }

  const d3 = window.d3;
  const svg = d3.select(svgNode);
  const viewport = d3.select(viewportNode);
  svg.call(
    d3.zoom().scaleExtent([0.75, 1.9]).on("zoom", (event) => {
      viewport.attr("transform", event.transform);
    })
  );
  svg.on("dblclick.zoom", null);
}

function exportAutomaton(kind) {
  let automaton = null;

  if (kind === "dfa") {
    automaton = validateDfa(true);
  } else if (kind === "nfa") {
    automaton = validateNfa(true);
  } else if (kind === "converter") {
    automaton = appState.converter.dfa;
    if (!automaton) {
      renderMessages(ui.converter.messages, ["Convert an NFA before exporting the equivalent DFA."], "error");
      return;
    }
  }

  if (!automaton) {
    return;
  }

  const fileName = kind === "converter" ? "converted-dfa.json" : `${kind}-automaton.json`;
  const blob = new Blob([JSON.stringify(automaton, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function importAutomaton(event, kind) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (kind === "dfa") {
        const automaton = normalizeImportedDfa(data);
        populateAutomatonForm("dfa", automaton);
        renderDfaTable(buildDraftFromTransitionMap(automaton.transitions));
        validateDfa(true);
      } else {
        const automaton = normalizeImportedNfa(data);
        populateAutomatonForm("nfa", automaton);
        renderNfaTable(buildDraftFromTransitionMap(automaton.transitions, true));
        validateNfa(true);
        clearConverterResults();
      }
    } catch (error) {
      const target = kind === "dfa" ? ui.dfa.validationMessages : ui.nfa.validationMessages;
      renderMessages(target, [`Could not import JSON: ${error.message}`], "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function normalizeImportedDfa(data) {
  const automaton = {
    type: "DFA",
    states: ensureStringArray(data.states),
    alphabet: ensureStringArray(data.alphabet),
    startState: String(data.startState ?? data.start ?? "").trim(),
    finalStates: ensureStringArray(data.finalStates ?? data.finals),
    transitions: data.transitions && typeof data.transitions === "object" ? data.transitions : {},
  };

  if (!automaton.states.length || !automaton.alphabet.length || !automaton.startState) {
    throw new Error("The JSON file is missing required DFA fields.");
  }

  return automaton;
}

function normalizeImportedNfa(data) {
  const transitions = {};
  const states = ensureStringArray(data.states);
  const alphabet = ensureStringArray(data.alphabet);

  Object.entries(data.transitions || {}).forEach(([state, mapping]) => {
    transitions[state] = {};
    Object.entries(mapping || {}).forEach(([symbol, rawTarget]) => {
      const normalizedSymbol = symbol === "epsilon" ? EPSILON : symbol;
      transitions[state][normalizedSymbol] = Array.isArray(rawTarget) ? rawTarget.map(String) : parseCSVList(String(rawTarget || ""), true);
    });
  });

  const automaton = {
    type: "NFA",
    states,
    alphabet,
    startState: String(data.startState ?? data.start ?? "").trim(),
    finalStates: ensureStringArray(data.finalStates ?? data.finals),
    transitions,
  };

  if (!automaton.states.length || !automaton.alphabet.length || !automaton.startState) {
    throw new Error("The JSON file is missing required NFA fields.");
  }

  states.forEach((state) => {
    automaton.transitions[state] = automaton.transitions[state] || {};
    [...alphabet, EPSILON].forEach((symbol) => {
      automaton.transitions[state][symbol] = automaton.transitions[state][symbol] || [];
    });
  });

  return automaton;
}

function clearConverterResults() {
  appState.converter.dfa = null;
  renderMessages(ui.converter.messages, [], "info");
  ui.converter.sourceStates.textContent = "-";
  ui.converter.resultStates.textContent = "-";
  ui.converter.startState.textContent = "-";
  setPlaceholder(ui.converter.log, "Convert a validated NFA to view the subset construction trace.");
  setPlaceholder(ui.converter.summary, "Converted DFA details will appear here after running the converter.");
  setPlaceholder(ui.converter.tableWrapper, "Converted transitions will appear here after running the converter.");
  setPlaceholder(ui.converter.graph, "Run the conversion to visualize the equivalent DFA.");
}

function renderMessages(container, messages, type = "info") {
  container.innerHTML = "";
  messages.forEach((message) => {
    const item = document.createElement("div");
    item.className = `message ${type}`;
    item.textContent = message;
    container.appendChild(item);
  });
}

function setPlaceholder(element, message) {
  element.classList.add("placeholder-panel");
  element.innerHTML = "";
  element.textContent = message;
}

function setStatusBadge(element, label, type) {
  element.textContent = label;
  element.className = `status-badge ${type}`;
}

function parseCSVUnique(value) {
  return parseCSVList(value, true);
}

function parseCSVList(value, unique = true) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return unique ? Array.from(new Set(items)) : items;
}

function tokenizeInput(rawValue, alphabet) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return { tokens: [], error: null };
  }

  if (value.includes(",")) {
    return { tokens: parseCSVList(value, false), error: null };
  }

  if (alphabet.every((symbol) => symbol.length === 1)) {
    return { tokens: value.split(""), error: null };
  }

  const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
  const tokens = [];
  let cursor = 0;

  while (cursor < value.length) {
    const match = sortedAlphabet.find((symbol) => value.startsWith(symbol, cursor));
    if (!match) {
      return {
        tokens: [],
        error: "Multi-character alphabets must use comma-separated tokens, or the string must match symbols unambiguously.",
      };
    }
    tokens.push(match);
    cursor += match.length;
  }

  return { tokens, error: null };
}

function ensureStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function subsetLabel(set) {
  const values = Array.from(set).sort();
  return values.length ? `{${values.join(",")}}` : EMPTY_SET;
}

function setKey(set) {
  const values = Array.from(set).sort();
  return values.length ? values.join("|") : EMPTY_SET;
}

function displaySet(set) {
  const values = Array.from(set).sort();
  return values.length ? `{${values.join(", ")}}` : EMPTY_SET;
}

function countMeaningfulSteps(simulation) {
  return Math.max(simulation.steps.length - 1, 1);
}

function formatTokenSequence(tokens) {
  return tokens.length ? `"${tokens.join(", ")}"` : "the empty string";
}

function cellKey(state, symbol) {
  return `${state}::${symbol}`;
}

function quadraticPoint(x0, y0, x1, y1, x2, y2, t) {
  const inverse = 1 - t;
  return {
    x: inverse * inverse * x0 + 2 * inverse * t * x1 + t * t * x2,
    y: inverse * inverse * y0 + 2 * inverse * t * y1 + t * t * y2,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
