# Automata Simulator and Visualizer

Browser-based toolkit for building, validating, simulating, and converting finite automata with plain HTML, CSS, and JavaScript.

No backend, build step, or framework is required. Open `index.html` in a modern browser and the app is ready to use.

## Current Website Highlights

- Light-first, responsive interface with a floating theme toggle
- Live-edit DFA and NFA workspaces that refresh while you type
- Step-by-step simulation logs with active-state graph highlighting
- NFA support for branching transitions and epsilon moves
- NFA -> DFA subset construction with a readable conversion trace
- Converted DFA is automatically loaded into the DFA simulator
- JSON import and export for DFA, NFA, and converted DFA definitions

## Features

### DFA Simulator

- Define states, alphabet, start state, and final states
- Edit transitions in a grid-based table
- Validate the machine in real time
- Simulate input strings step by step
- View accepted or rejected status
- Track the current state and full path through the machine

### NFA Simulator

- Support multiple target states per symbol
- Support epsilon transitions through a dedicated epsilon column
- Show epsilon-closure behavior during simulation
- Keep the last valid preview visible while incomplete edits are being typed
- Display active state sets, traces, and graph updates in real time

### NFA to DFA Converter

- Converts the current NFA preview using subset construction
- Shows the subset construction log, transition table, and converted graph
- Displays subset membership for each generated DFA state
- Loads the resulting DFA into the DFA section automatically for immediate simulation

### Visualization and UI

- SVG-based automata graphs
- Optional D3 pan and zoom enhancement when the CDN is available
- Responsive dashboard layout with sidebar navigation
- Professional light and dark themes

## Project Structure

```text
toc/
|-- index.html
|-- style.css
|-- script.js
`-- README.md
```

## Run Locally

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.

That is all. No install process, package manager, or server is needed.

## Recommended Workflow

1. Open either the DFA or NFA section from the sidebar.
2. Edit the sample machine or import a JSON file.
3. Update states, alphabet, finals, and transitions. The machine preview updates live.
4. Enter an input string and use `Prepare`, `Next Step`, or `Auto Play` to simulate.
5. For NFA conversion, open the Converter section and click `Convert Current NFA`.
6. After conversion, switch to the DFA section to test the generated DFA immediately.

## JSON Import Format

### DFA Example

```json
{
  "type": "DFA",
  "states": ["q0", "q1"],
  "alphabet": ["0", "1"],
  "startState": "q0",
  "finalStates": ["q1"],
  "transitions": {
    "q0": { "0": "q0", "1": "q1" },
    "q1": { "0": "q0", "1": "q1" }
  }
}
```

### NFA Example

```json
{
  "type": "NFA",
  "states": ["q0", "q1", "q2"],
  "alphabet": ["a", "b"],
  "startState": "q0",
  "finalStates": ["q2"],
  "transitions": {
    "q0": { "a": ["q0", "q1"], "b": [], "epsilon": ["q2"] },
    "q1": { "a": [], "b": ["q2"], "epsilon": [] },
    "q2": { "a": [], "b": [], "epsilon": [] }
  }
}
```

## Notes

- Multi-character alphabet symbols are supported. Use comma-separated input tokens when needed.
- If the D3 CDN is unavailable, the app still renders graphs through its built-in SVG output.
- Converted subset states are normalized for the DFA editor so they remain editable and simulation-safe.

## License

Open for learning, experimentation, and extension.
