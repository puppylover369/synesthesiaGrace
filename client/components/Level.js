import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import {noteRec, updateNotes} from '../store'
import Tone from 'tone'
import history from '../history'
const synth = new Tone.Synth().toMaster()
const colorToSound =
  {
    "R": "G4",
    "O": "A4",
    "Y": "B#4",
    "G": "C5",
    "B": "D5",
    "I": "E5",
    "V": "F5"
  }

/**
 * COMPONENT
 */
class Level extends React.Component
{
  componentDidMount()
  {
    this.props.loadLevel()
    // this.handleClick = this.handleClick.bind(this)
    addEventListener("keypress", e =>
    {
      this.handleClick(e, e.key)
    })
  }

  handleClick(e, key)
  {
    e.preventDefault()
    const {notes} = this.props;

    //Play note whenever key or block is pressed
    synth.triggerAttackRelease(colorToSound[key.toUpperCase()], '8n')

    if (key.toUpperCase() !== notes[0])
      history.push('/')
    else
    {
      if (notes.length === 1)
      {
        history.push(`/levels/${+this.props.match.params.levelId + 1}`)
        setTimeout(() => window.location.reload(false), 700); //Should I do this?
      }
      else
        this.props.update(notes.slice(1))
    }
  }

  render()
  {
    const {notes} = this.props
    const levelId = +this.props.match.params.levelId
    const keyToClassName =
      {
        "R": "red",
        "O": "orange",
        "Y": "yellow",
        "G": "green",
        "B": "blue",
        "I": "indigo",
        "V": "violet"
      }
    const showKey = [1, 2, 3, 9, 16, 18, 20, 23] //levels in which I want key to show
    return ( //Rerenders every time key is pressed, but now it's not a bug, it's a feature ;)
      <div className="notes">
        {
          _.uniq(notes).sort(function (a, b)
          {
            return 0.5 - Math.random()
          }).map(note =>
          {
            return (
              <svg className={"note " + keyToClassName[note]} key={note} onClick={e => this.handleClick(e, note)}>
                <rect width="100" height="100"/>
              </svg>
            )
          })
        }
        {
          showKey.indexOf(levelId) !== -1 &&
            <div className="key">
              <h1>Press</h1>
              {
                _.uniq(notes).map(note =>
                {
                  return (
                    <h1 key={note}>{note} for {keyToClassName[note].slice(0, 1).toUpperCase() + keyToClassName[note].slice(1)}</h1>
                  )
                })
              }
            </div>
        }
      </div>
    )
  }

}

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    notes: state.notes
  }
}

const mapDispatch = (dispatch, ownProps) => {
  let levelId = ownProps.match.params.levelId
  return {
    loadLevel () {
      dispatch(noteRec(levelId)).then((action) =>
      {
        action.notes.forEach((note, time) =>
        {
          synth.triggerAttackRelease(colorToSound[note], '8n', time*.7)
        })
      })
    },
    update (notes) {
      dispatch(updateNotes(notes))
    }

  }
}

export default connect(mapState, mapDispatch)(Level)
