import React from 'react';
import ReactDOM from 'react-dom';
import Clock from './clock';
import Piano from './piano';
import Guitar from './guitar';
import * as Util from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: Util.none,
      oscillators: [],
      gains: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    const { pianoKeyNames, frequencies } = Util;
    const context = new AudioContext();
    const gains = [];
    const oscillators = pianoKeyNames.map((name) => {
      let nextEl = context.createOscillator();
      let nextGain = context.createGain();
      nextEl.connect(nextGain);
      nextGain.connect(context.destination);
      nextGain.gain.value = 0;
      gains.push(nextGain);
      nextEl.frequency.value = frequencies[name];
      nextEl.type = 'sine';
      nextEl.start(0);
      return nextEl;
    });
    this.setState({oscillators, gains});
  }



  handleKeyDown(e) {
    e.preventDefault();
    const newNotes = [...this.state.notes];
    const newGains = [...this.state.gains];
    const idx = Util.keyMap[e.keyCode];
    if (idx || idx === 0) {
      newNotes[idx % 12] = true;
      const { context } = newGains[idx];
      newGains[idx].gain
        .linearRampToValueAtTime(1, context.currentTime + 0.2);
      this.setState({
        notes: newNotes,
        gains: newGains
      });
    }
  }

  handleKeyUp(e) {
    e.preventDefault();
    const newNotes = [...this.state.notes];
    const newGains = [...this.state.gains];
    const idx = Util.keyMap[e.keyCode];
    if (idx || idx === 0) {
      newNotes[idx % 12] = false;
      const { context } = newGains[idx];
      newGains[idx].gain
        .linearRampToValueAtTime(0, context.currentTime + 0.2);
      this.setState({
        notes: newNotes,
        gains: newGains
      });
    }
  }

  handleClick(i) {
    const newNotes = [...this.state.notes];
    newNotes[i % 12] = !this.state.notes[i % 12];
    this.setState({notes: newNotes});
  }

  render() {

    return (
      <div>
        <Guitar notes={this.state.notes}
                handleKeyUp={this.handleKeyUp}
                handleKeyDown={this.handleKeyDown}
                handleClick={this.handleClick}/>
              <div className="piano-clock-container">
          <Piano notes={this.state.notes}
                 handleKeyUp={this.handleKeyUp}
                 handleKeyDown={this.handleKeyDown}
                 handleClick={this.handleClick}/>
          <Clock notes={this.state.notes}
                 handleClick={this.handleClick}
                 handleKeyUp={this.handleKeyUp}
                 handleKeyDown={this.handleKeyDown}/>
        </div>
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
});
//
