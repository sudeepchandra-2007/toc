# Automata Simulator and Visualizer

A complete web-based educational tool for building, simulating, and visualizing finite automata directly in the browser.

This project is built with plain `HTML`, `CSS`, and `JavaScript`, with no backend required. It allows users to define and test both `DFA` and `NFA` machines, step through input strings, inspect execution logs, convert `NFA` to `DFA`, and view automata as interactive state graphs.

## Features

### DFA Simulator
- Define states, alphabet, start state, and final states
- Build transitions using an editable grid UI
- Validate DFA rules before simulation
- Run input strings step by step
- View accepted or rejected results
- See the transition path and active state updates

### NFA Simulator
- Support multiple target states per transition
- Support epsilon (`ε`) transitions
- Simulate branching behavior with epsilon-closure handling
- Show active state sets during execution
- View step-by-step state-set traces

### NFA to DFA Converter
- Converts the currently defined NFA using subset construction
- Displays the resulting DFA states, transitions, and final states
- Shows a conversion trace log for learning and debugging

### Visualization
- Draws automata as graphs using SVG
- Uses `D3.js` for pan and zoom enhancement when available
- Highlights active states during simulation
- Supports self-loops and bidirectional transitions

### UI and UX
- Responsive layout for desktop and smaller screens
- Sidebar navigation for DFA, NFA, and Converter views
- Dark and light theme toggle
- Modern card-based interface with smooth transitions

### Extras Included
- Import automata from JSON
- Export DFA, NFA, and converted DFA as JSON
- Preloaded sample DFA and NFA examples on page load

## Project Structure

```text
toc/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.

That is all. No installation, build step, or server is required.

## How to Use

### DFA
1. Open the `DFA` section from the sidebar.
2. Enter:
   - states
   - alphabet
   - start state
   - final states
3. Click `Generate Table`.
4. Fill the transition table.
5. Click `Validate`.
6. Enter an input string.
7. Use `Prepare Steps`, `Next Step`, or `Auto Play` to simulate.

### NFA
1. Open the `NFA` section.
2. Enter states, alphabet, start state, and final states.
3. Click `Generate Table`.
4. Fill the transition table.
   - multiple targets can be comma separated
   - epsilon moves go in the `ε` column
5. Click `Validate`.
6. Enter an input string and prepare the simulation.

### Converter
1. Build and validate an NFA first.
2. Open the `Converter` section.
3. Click `Convert Current NFA`.
4. Inspect:
   - subset construction log
   - resulting DFA summary
   - converted DFA transition table
   - converted graph

## JSON Format

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
    "q0": { "a": ["q0", "q1"], "b": [], "ε": [] },
    "q1": { "a": [], "b": ["q2"], "ε": [] },
    "q2": { "a": [], "b": [], "ε": [] }
  }
}
```

## Algorithms Used

- DFA simulation
- NFA simulation with epsilon-closure
- Subset construction for `NFA → DFA` conversion
- SVG-based graph rendering with optional D3 zoom behavior

## Notes

- The app works by simply opening `index.html`.
- If the D3 CDN is unavailable, the graph still renders because the core visualization is generated with SVG.
- For multi-character alphabet symbols, comma-separated input tokens are supported.

## License

This project is open for learning, experimentation, and extension.
